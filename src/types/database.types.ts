// src/types/database.types.ts

export interface Profile {
  id: string
  name: string | null
  gender: string | null
  roll_no: string | null
  dob: string | null
  created_at: string
  updated_at: string
}

// // If you plan to add more tables later, you can group them under a Database namespace:
// export interface Database {
//   public: {
//     Tables: {
//       profiles: {
//         Row: Profile
//         Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'> & { id?: string }
//         Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
//       }
//       // Add other tables here
//     }
//   }
// }
