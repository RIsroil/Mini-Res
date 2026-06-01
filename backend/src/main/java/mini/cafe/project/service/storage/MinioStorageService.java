package mini.cafe.project.service.storage;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MinioStorageService implements StorageService {

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    private final MinioClient minioClient;

    @Value("${minio.public-url}")
    private String minioPublicUrl;

    @Value("${minio.bucket-name}")
    private String bucketName;

    @Override
    public String uploadImage(MultipartFile file, String folder) {
        validateImage(file);

        String objectName = folder + "/" + UUID.randomUUID() + getExtension(file);
        try {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectName)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());

            String url = minioPublicUrl + "/" + bucketName + "/" + objectName;
            log.info("Uploaded to MinIO: {}/{}", bucketName, objectName);
            return url;
        } catch (Exception e) {
            log.error("MinIO upload failed for bucket={} object={}: {}", bucketName, objectName, e.getMessage());
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    @Override
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return;
        try {
            String path = imageUrl.startsWith(minioPublicUrl)
                    ? imageUrl.substring(minioPublicUrl.length())
                    : imageUrl;
            if (path.startsWith("/")) path = path.substring(1);

            int slash = path.indexOf('/');
            if (slash < 0) {
                log.warn("Cannot parse bucket from MinIO URL: {}", imageUrl);
                return;
            }
            String bucket = path.substring(0, slash);
            String object = path.substring(slash + 1);

            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucket)
                    .object(object)
                    .build());
            log.info("Deleted from MinIO: {}/{}", bucket, object);
        } catch (Exception e) {
            log.warn("MinIO delete failed for {}: {}", imageUrl, e.getMessage());
        }
    }

    private void validateImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file type. Only JPEG, PNG, and WebP are allowed");
        }
    }

    private String getExtension(MultipartFile file) {
        String name = file.getOriginalFilename();
        if (name != null && name.contains(".")) {
            return name.substring(name.lastIndexOf('.'));
        }
        return "";
    }
}
