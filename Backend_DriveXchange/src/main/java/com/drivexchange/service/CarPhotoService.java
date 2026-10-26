package com.drivexchange.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import com.drivexchange.entity.CarEntity;
import com.drivexchange.repo.CarRepository;

/**
 * Receives car photos, checks them, sends them to Cloudinary and stores ONLY the returned links in car_photos.
 * An uploaded file is untrusted input, so we check: who is uploading, how many, how big, and what it REALLY is
 * (the first bytes of the file, not the name or the Content-Type the browser claims).
 */
@Service
public class CarPhotoService {

    public static final int MAX_PHOTOS_PER_CAR = 6;
    private static final long MAX_BYTES = 5L * 1024 * 1024;

    private final Cloudinary cloudinary;
    private final CarRepository carRepository;

    public CarPhotoService(Cloudinary cloudinary, CarRepository carRepository) {
        this.cloudinary = cloudinary;
        this.carRepository = carRepository;
    }

    @SuppressWarnings("rawtypes")
	@Transactional
    public List<String> addPhotos(UUID carId, String ownerEmail, List<MultipartFile> files) {
        CarEntity car = carRepository.findById(carId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found"));

        // only the owner, and only while the car can still be edited
        if (!car.getUser().getEmail().equalsIgnoreCase(ownerEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can't add photos to this car");
        }
        if (!"Available".equalsIgnoreCase(car.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This car can't be changed right now");
        }
        if (files == null || files.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose at least one photo");
        }
        int already = car.getPhotUrls() == null ? 0 : car.getPhotUrls().size();
        if (already + files.size() > MAX_PHOTOS_PER_CAR) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "A car can have at most " + MAX_PHOTOS_PER_CAR + " photos");
        }

        // 1) check EVERYTHING first, so a bad 4th file doesn't leave 3 uploaded files behind
        List<byte[]> checked = new ArrayList<>();
        for (MultipartFile f : files) {
            checked.add(readAndCheck(f));
        }

        // 2) upload
        List<String> urls = new ArrayList<>();
        for (byte[] bytes : checked) {
            try {
                Map<?, ?> result = cloudinary.uploader().upload(bytes, ObjectUtils.asMap(
                        "folder", "drivexchange/cars",
                        "resource_type", "image",
                        // never store giant originals: shrink to at most 1600px on the long side
                        "transformation", new Transformation().width(1600).height(1600).crop("limit")));
                urls.add((String) result.get("secure_url"));
            } catch (IOException | RuntimeException e) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Photo upload failed. Please try again.");
            }
        }

        // 3) remember the links
        car.getPhotUrls().addAll(urls);
        carRepository.save(car);
        return urls;
    }

    private byte[] readAndCheck(MultipartFile f) {
        if (f.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One of the files is empty");
        }
        if (f.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Each photo must be 5 MB or smaller");
        }
        byte[] b;
        try {
            b = f.getBytes();
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not read one of the files");
        }
        if (!(isJpeg(b) || isPng(b) || isWebp(b))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only JPG, PNG or WEBP photos are allowed");
        }
        return b;
    }

    private static boolean isJpeg(byte[] b) {
        return b.length > 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF;
    }

    private static boolean isPng(byte[] b) {
        return b.length > 8 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G';
    }

    private static boolean isWebp(byte[] b) {   // "RIFF" .... "WEBP"
        return b.length > 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P';
    }
}
