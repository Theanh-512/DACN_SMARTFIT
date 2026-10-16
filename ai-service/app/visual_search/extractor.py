import io
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
import logging

logger = logging.getLogger(__name__)

class VisualFeatureExtractor:
    """
    Trích xuất đặc trưng thị giác (Deep Visual Embedding) từ hình ảnh sản phẩm thời trang.
    Sử dụng backbone MobileNetV3-Small đã được tiền huấn luyện trên ImageNet,
    kết hợp lớp chiếu phẳng Global Average Pooling và chuẩn hóa L2 norm.
    Độ phức tạp tính toán thấp (~15-25ms trên CPU), đảm bảo độ trễ phản hồi thời gian thực.
    """
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self, device: str = "cpu"):
        self.device = torch.device(device if torch.cuda.is_available() and device == "cuda" else "cpu")
        logger.info(f"Khởi tạo VisualFeatureExtractor trên thiết bị: {self.device}")
        
        # Tải mô hình MobileNetV3-Small nhẹ (9.8MB) và tối ưu cho suy luận nhúng
        weights = models.MobileNet_V3_Small_Weights.DEFAULT
        base_model = models.mobilenet_v3_small(weights=weights)
        
        # Lấy phần trích xuất đặc trưng (bỏ lớp phân loại cuối Classifier)
        self.features = base_model.features
        self.pool = base_model.avgpool
        self.model = torch.nn.Sequential(self.features, self.pool)
        self.model.to(self.device)
        self.model.eval()

        # Chuẩn hóa tiền xử lý tiêu chuẩn ImageNet
        self.preprocess = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        
        # Kích thước vector đặc trưng đầu ra
        self.embedding_dim = 576

    def extract_from_pil(self, img: Image.Image) -> np.ndarray:
        """
        Trích xuất vector đặc trưng từ đối tượng PIL Image, chuẩn hóa vector đơn vị L2.
        """
        if img.mode != "RGB":
            img = img.convert("RGB")
            
        tensor = self.preprocess(img).unsqueeze(0).to(self.device)
        with torch.no_grad():
            feat = self.model(tensor)
            feat = torch.flatten(feat, 1)
            # Chuẩn hóa L2 norm: ||v||_2 = 1.0
            norm = torch.norm(feat, p=2, dim=1, keepdim=True)
            feat = feat / (norm + 1e-7)
            
        return feat.cpu().numpy()[0]

    def extract_from_bytes(self, image_bytes: bytes) -> np.ndarray:
        """
        Trích xuất vector đặc trưng từ mảng byte nhị phân của ảnh tải lên.
        """
        img = Image.open(io.BytesIO(image_bytes))
        return self.extract_from_pil(img)
