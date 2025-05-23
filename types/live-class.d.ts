// filepath: c:\next_js_projects\LMS\types\live-class.d.ts
export interface LiveClass {
    id: string; // Or number, depending on your DB
    courseId: string; // Or number
    roomName: string; // Unique name for the Jitsi room
    topic: string;
    description?: string;
    scheduledAt?: string | Date; // Optional: if you want to schedule
    createdAt: string | Date;
    // You can add more fields like 'hostName', 'duration', etc.
  }
  
  export interface CreateLiveClassPayload {
    topic: string;
    description?: string;
    scheduledAt?: string; // ISO string format
    // roomName will likely be auto-generated or based on topic/courseId
  }