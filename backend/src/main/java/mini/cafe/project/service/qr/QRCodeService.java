package mini.cafe.project.service.qr;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class QRCodeService {

    private static final Logger logger = LoggerFactory.getLogger(QRCodeService.class);

    @Value("${app.frontend-url:https://domain.com}")
    private String frontendUrl;

    // TODO: Inject StorageService when needed
    // private final StorageService storageService;

    public String generateQRCode(String restaurantSlug) {
        try {
            String url = frontendUrl + "/r/" + restaurantSlug;
            BufferedImage qrImage = createQRImage(url, 300, 300);

            // TODO: Upload to MinIO when needed
            // ByteArrayOutputStream baos = new ByteArrayOutputStream();
            // ImageIO.write(qrImage, "PNG", baos);
            // byte[] imageBytes = baos.toByteArray();
            // String fileName = "qr-codes/" + restaurantSlug + ".png";
            // return storageService.uploadImage(...);

            // For now, return a placeholder URL
            String qrUrl = frontendUrl + "/qr/" + restaurantSlug + ".png";
            logger.info("Generated QR code URL: {}", qrUrl);
            return qrUrl;

        } catch (Exception e) {
            logger.error("Failed to generate QR code for restaurant: {}", restaurantSlug, e);
            throw new RuntimeException("Failed to generate QR code", e);
        }
    }

    private BufferedImage createQRImage(String text, int width, int height) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();

        Map<EncodeHintType, Object> hints = new HashMap<>();
        hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
        hints.put(EncodeHintType.MARGIN, 1);

        BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height, hints);
        return MatrixToImageWriter.toBufferedImage(bitMatrix);
    }
}
