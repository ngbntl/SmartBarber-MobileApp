import Api from "./api";

class PromotionsApi extends Api {
  constructor() {
    super("promotions");
  }

  async getPromotions() {
    try {
      return await this.request("get", "");
    } catch (error) {
      throw error;
    }
  }

  async getAvailablePromotions() {
    try {
      const promotions = await this.request("get", "?isActive=true");
      const now = new Date();

      return Array.isArray(promotions)
        ? promotions.filter((promo: any) => {
            const startDate = promo.startDate
              ? new Date(promo.startDate)
              : null;
            const endDate = promo.endDate ? new Date(promo.endDate) : null;

            return (
              promo.isActive &&
              (!startDate || startDate <= now) &&
              (!endDate || endDate >= now)
            );
          })
        : [];
    } catch (error) {
      console.error("Error fetching available promotions:", error);
      return [];
    }
  }

  async getPromotionByCode(code: string) {
    try {
      const response = await this.request("get", `?code=${code}`);

      if (Array.isArray(response) && response.length > 0) {
        const promotion = response.find(
          (promo: any) => promo.code.toUpperCase() === code.toUpperCase()
        );

        if (promotion) {
          const now = new Date();
          const startDate = promotion.startDate
            ? new Date(promotion.startDate)
            : null;
          const endDate = promotion.endDate
            ? new Date(promotion.endDate)
            : null;

          if (
            promotion.isActive &&
            (!startDate || startDate <= now) &&
            (!endDate || endDate >= now)
          ) {
            return promotion;
          }
        }
      }

      return null;
    } catch (error) {
      console.error("Error fetching promotion by code:", error);
      return null;
    }
  }

  async validatePromotion(code: string, totalAmount: number) {
    try {
      const promotion = await this.getPromotionByCode(code);

      if (!promotion) {
        return {
          valid: false,
          message: "Mã khuyến mãi không tồn tại hoặc đã hết hạn.",
        };
      }

      // Check minimum purchase amount if specified
      if (
        promotion.minimumPurchaseAmount &&
        parseFloat(promotion.minimumPurchaseAmount) > totalAmount
      ) {
        return {
          valid: false,
          message: `Đơn hàng tối thiểu ${parseFloat(
            promotion.minimumPurchaseAmount
          ).toLocaleString("vi-VN")}₫ để sử dụng mã này.`,
          promotion,
        };
      }

      // Calculate discount amount
      const discountAmount = promotion.isPercentage
        ? (totalAmount * parseFloat(promotion.discountPercent)) / 100
        : parseFloat(promotion.discountAmount);

      return {
        valid: true,
        message: "Mã khuyến mãi hợp lệ.",
        promotion,
        discountAmount,
      };
    } catch (error) {
      console.error("Error validating promotion:", error);
      return {
        valid: false,
        message: "Có lỗi xảy ra khi kiểm tra mã khuyến mãi.",
      };
    }
  }

  async applyPromotion(appointmentId: string, promotionCode: string) {
    try {
      // Apply promotion to an appointment
      return await this.request("post", `apply/${appointmentId}`, {
        promotionCode,
      });
    } catch (error) {
      console.error("Error applying promotion to appointment:", error);
      throw error;
    }
  }
}

export default PromotionsApi;
