export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      plants: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          room_id: string | null;
          species: string | null;
          pot_size: string | null;
          pot_material: string | null;
          soil_type: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          room_id?: string | null;
          species?: string | null;
          pot_size?: string | null;
          pot_material?: string | null;
          soil_type?: string | null;
          created_at?: string | null;
        };
        Update: {
          name?: string;
          room_id?: string | null;
          species?: string | null;
          pot_size?: string | null;
          pot_material?: string | null;
          soil_type?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "plants_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          plant_id: string;
          type: string;
          due_at: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          plant_id: string;
          type: string;
          due_at: string;
          created_at?: string | null;
        };
        Update: {
          type?: string;
          due_at?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_plant_id_fkey";
            columns: ["plant_id"];
            referencedRelation: "plants";
            referencedColumns: ["id"];
          }
        ];
      };
      plant_photos: {
        Row: {
          id: string;
          user_id: string;
          plant_id: string;
          url: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          plant_id: string;
          url: string;
          created_at?: string | null;
        };
        Update: {
          url?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "plant_photos_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plant_photos_plant_id_fkey";
            columns: ["plant_id"];
            referencedRelation: "plants";
            referencedColumns: ["id"];
          }
        ];
      };
      plant_notes: {
        Row: {
          id: string;
          user_id: string;
          plant_id: string;
          note: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          plant_id: string;
          note: string;
          created_at?: string | null;
        };
        Update: {
          note?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "plant_notes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plant_notes_plant_id_fkey";
            columns: ["plant_id"];
            referencedRelation: "plants";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
