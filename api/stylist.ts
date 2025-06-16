import Api from "./api";

// Định nghĩa kiểu dữ liệu cho Favorite Service
interface FavoriteService {
  id: string;
  name: string;
  useCount: number;
}

// Định nghĩa kiểu dữ liệu cho Customer
interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatar: string;
  serviceCount: number;
  completedAppointments: number;
  lastServiceDate: string;
  totalSpent: number;
  hasPendingAppointment: boolean;
  hasConfirmedAppointment: boolean;
  favoriteService: FavoriteService;
}

// Định nghĩa kiểu dữ liệu cho API Response
interface CustomersResponse {
  items: Customer[];
  total: number;
}

export interface StylistUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  specialization?: string;
  experienceYears?: number;
  isActive?: boolean;
  phoneNumber?: string;
  branchId?: string;
}

class StylistApi extends Api {
  constructor() {
    super("stylists");
  }

  async getStylistByBranchId(branchId: string) {
    try {
      return await this.request("get", "/branch/" + branchId);
    } catch (error) {
      throw error;
    }
  }

  async getStylistSchedule(stylistId: string) {
    try {
      return await this.request("get", `/schedule/${stylistId}`);
    } catch (error) {
      throw error;
    }
  }

  async getStylistDaysOff(stylistId: string) {
    try {
      return await this.request("get", `/time-offs/${stylistId}`);
    } catch (error) {
      throw error;
    }
  }

  async addDayOff(data: any) {
    try {
      return await this.request("post", `/time-off`, data);
    } catch (error) {
      throw error;
    }
  }

  async removeDayOff(dayOffId: string) {
    try {
      return await this.request("delete", `/time-off/${dayOffId}`);
    } catch (error) {
      throw error;
    }
  }

  async getReviews(stylistId: string) {
    try {
      return await this.request("get", `/reviews/${stylistId}`);
    } catch (error) {
      throw error;
    }
  }

  async getCustomers(stylistId: string): Promise<CustomersResponse> {
    try {
      return await this.request("get", `/${stylistId}/customers`);
    } catch (error) {
      throw error;
    }
  }

  async updateStylist(stylistId: string, data: StylistUpdateData) {
    try {
      return await this.request("put", `/${stylistId}`, data);
    } catch (error) {
      throw error;
    }
  }
}

export default StylistApi;
