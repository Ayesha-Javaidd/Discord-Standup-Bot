// const API_BASE_URL = 'http://localhost:8000';

// export interface ApiResponse<T> {
//   data?: T;
//   error?: string;
// }

// export interface Checkin {
//   id: number;
//   name: string;
//   channel_id: string;
//   schedule_time: string;
//   post_time: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface Question {
//   id: number;
//   checkin_id: number;
//   question_text: string;
//   order: number;
//   created_at: string;
// }

// export interface User {
//   id: number;
//   discord_id: string;
//   username: string;
//   display_name: string;
//   avatar_url: string;
//   created_at: string;
//   updated_at: string;
// }

// export interface Response {
//   id: number;
//   checkin_id: number;
//   user_id: number;
//   question_id: number;
//   response_text: string;
//   response_date: string;
//   created_at: string;
//   user: User;
//   question: Question;
// }

// export interface CheckinFull {
//   checkin: Checkin;
//   questions: Question[];
//   users: User[];
// }

// class ApiService {
//   // private getHeaders(): Headers {
//   //   const apiKey = localStorage.getItem('apiKey');
//   //   const headers = new Headers({
//   //     'Content-Type': 'application/json',
//   //   });
    
//   //   if (apiKey) {
//   //     headers.append('X-API-KEY', apiKey);
//   //   }
    
//   //   return headers;
//   // }



//   private getHeaders(): Record<string, string> {
//   const apiKey = localStorage.getItem('apiKey');
//   const headers: Record<string, string> = {
//     'Content-Type': 'application/json',
//   };
  
//   if (apiKey) {
//     headers['X-API-KEY'] = apiKey;
//   }
  
//   return headers;
// }

//   private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
//     try {
//       const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//         ...options,
//         headers: {
//           ...this.getHeaders(),
//           ...options.headers,
//         },
//       });

//       if (!response.ok) {
//         if (response.status === 401 || response.status === 403) {
//           throw new Error('Invalid API key');
//         }
//         throw new Error(`API Error: ${response.status}`);
//       }

//       const data = await response.json();
//       return { data };
//     } catch (error) {
//       return { error: error instanceof Error ? error.message : 'Unknown error' };
//     }
//   }

//   // Checkins
//   async getCheckins(): Promise<ApiResponse<Checkin[]>> {
//     return this.request<Checkin[]>('/checkins/');
//   }

//   async getCheckinFull(id: number): Promise<ApiResponse<CheckinFull>> {
//     return this.request<CheckinFull>(`/checkins/${id}/full`);
//   }

//   async createCheckin(checkin: Omit<Checkin, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Checkin>> {
//     return this.request<Checkin>('/checkins/', {
//       method: 'POST',
//       body: JSON.stringify(checkin),
//     });
//   }

//   async updateCheckin(id: number, checkin: Omit<Checkin, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Checkin>> {
//     return this.request<Checkin>(`/checkins/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(checkin),
//     });
//   }

//   async deleteCheckin(id: number): Promise<ApiResponse<void>> {
//     return this.request<void>(`/checkins/${id}`, {
//       method: 'DELETE',
//     });
//   }

//   // Questions
//   async getQuestions(checkinId: number): Promise<ApiResponse<Question[]>> {
//     return this.request<Question[]>(`/questions/?checkin_id=${checkinId}`);
//   }

//   async createQuestion(checkinId: number, question: Omit<Question, 'id' | 'checkin_id' | 'created_at'>): Promise<ApiResponse<Question>> {
//     return this.request<Question>(`/questions/?checkin_id=${checkinId}`, {
//       method: 'POST',
//       body: JSON.stringify(question),
//     });
//   }

//   async updateQuestion(id: number, question: Omit<Question, 'id' | 'checkin_id' | 'created_at'>): Promise<ApiResponse<Question>> {
//     return this.request<Question>(`/questions/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(question),
//     });
//   }

//   async deleteQuestion(id: number): Promise<ApiResponse<void>> {
//     return this.request<void>(`/questions/${id}`, {
//       method: 'DELETE',
//     });
//   }

//   // Users
//   async getUsers(): Promise<ApiResponse<User[]>> {
//     return this.request<User[]>('/users/');
//   }

//   async getUsersByCheckin(checkinId: number): Promise<ApiResponse<User[]>> {
//     return this.request<User[]>(`/users/by_checkin/${checkinId}`);
//   }

//   async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<User>> {
//     return this.request<User>('/users/', {
//       method: 'POST',
//       body: JSON.stringify(user),
//     });
//   }

//   async updateUser(id: number, user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<User>> {
//     return this.request<User>(`/users/${id}`, {
//       method: 'PUT',
//       body: JSON.stringify(user),
//     });
//   }

//   async deleteUser(id: number): Promise<ApiResponse<void>> {
//     return this.request<void>(`/users/${id}`, {
//       method: 'DELETE',
//     });
//   }

//   async addUserToCheckin(userId: number, checkinId: number): Promise<ApiResponse<void>> {
//     return this.request<void>('/users/add_to_checkin/', {
//       method: 'POST',
//       body: JSON.stringify({ user_id: userId, checkin_id: checkinId }),
//     });
//   }

//   async removeUserFromCheckin(userId: number, checkinId: number): Promise<ApiResponse<void>> {
//     return this.request<void>(`/users/remove_from_checkin/?user_id=${userId}&checkin_id=${checkinId}`, {
//       method: 'DELETE',
//     });
//   }

//   // Responses
//   async getResponses(checkinId?: number, responseDate?: string): Promise<ApiResponse<Response[]>> {
//     const params = new URLSearchParams();
//     if (checkinId) params.append('checkin_id', checkinId.toString());
//     if (responseDate) params.append('response_date', responseDate);
    
//     return this.request<Response[]>(`/responses/?${params.toString()}`);
//   }
// }

// export const api = new ApiService();



const API_BASE_URL = 'http://localhost:8000';
const API_KEY = "SDASDSADWQRGHY";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface Checkin {
  id: number;
  name: string;
  channel_id: string;
  schedule_time: string;
  post_time: string;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: number;
  checkin_id: number;
  question_text: string;
  order: number;
  created_at: string;
}

export interface User {
  id: number;
  discord_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface Response {
  id: number;
  checkin_id: number;
  user_id: number;
  question_id: number;
  response_text: string;
  response_date: string;
  created_at: string;
  user: User;
  question: Question;
}

export interface CheckinFull {
  checkin: Checkin;
  questions: Question[];
  users: User[];
}

class ApiService {
  private getHeaders(): Record<string, string> {
    // Always use a valid API key
    const apiKey = localStorage.getItem('apiKey') || 'SDASDSADWQRGHY';
    return {
      'Content-Type': 'application/json',
      'X-API-KEY': apiKey,
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...(options.headers || {}),
        },
        mode: 'cors', // Ensure CORS mode
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}: ${errorText}`);
        if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid API key');
        }
        throw new Error(errorText || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Fetch error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // ===== Checkins =====
  getCheckins() {
    return this.request<Checkin[]>('/checkins/');
  }

  getCheckinFull(id: number) {
    return this.request<CheckinFull>(`/checkins/${id}/full`);
  }

  createCheckin(checkin: Omit<Checkin, 'id' | 'created_at' | 'updated_at'>) {
    return this.request<Checkin>('/checkins/', {
      method: 'POST',
      body: JSON.stringify(checkin),
    });
  }

  updateCheckin(id: number, checkin: Omit<Checkin, 'id' | 'created_at' | 'updated_at'>) {
    return this.request<Checkin>(`/checkins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(checkin),
    });
  }

  deleteCheckin(id: number) {
    return this.request<void>(`/checkins/${id}`, { method: 'DELETE' });
  }

  // ===== Questions =====
  getQuestions(checkinId: number) {
    return this.request<Question[]>(`/questions/?checkin_id=${checkinId}`);
  }

  createQuestion(checkinId: number, question: Omit<Question, 'id' | 'checkin_id' | 'created_at'>) {
    return this.request<Question>(`/questions/?checkin_id=${checkinId}`, {
      method: 'POST',
      body: JSON.stringify(question),
    });
  }

  updateQuestion(id: number, question: Omit<Question, 'id' | 'checkin_id' | 'created_at'>) {
    return this.request<Question>(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(question),
    });
  }

  deleteQuestion(id: number) {
    return this.request<void>(`/questions/${id}`, { method: 'DELETE' });
  }

  // ===== Users =====
  getUsers() {
    return this.request<User[]>('/users/');
  }

  getUsersByCheckin(checkinId: number) {
    return this.request<User[]>(`/users/by_checkin/${checkinId}`);
  }

  createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    return this.request<User>('/users/', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  updateUser(id: number, user: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  deleteUser(id: number) {
    return this.request<void>(`/users/${id}`, { method: 'DELETE' });
  }

  addUserToCheckin(userId: number, checkinId: number) {
    return this.request<void>('/users/add_to_checkin/', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, checkin_id: checkinId }),
    });
  }

  removeUserFromCheckin(userId: number, checkinId: number) {
    return this.request<void>(`/users/remove_from_checkin/?user_id=${userId}&checkin_id=${checkinId}`, {
      method: 'DELETE',
    });
  }

  // ===== Responses =====
  getResponses(checkinId?: number, responseDate?: string) {
    const params = new URLSearchParams();
    if (checkinId) params.append('checkin_id', checkinId.toString());
    if (responseDate) params.append('response_date', responseDate);

    return this.request<Response[]>(`/responses/?${params.toString()}`);
  }
}

export const api = new ApiService();
