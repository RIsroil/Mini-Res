package mini.cafe.project.service.storage;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    String uploadImage(MultipartFile file, String folder);

    void deleteImage(String imageUrl);
}
