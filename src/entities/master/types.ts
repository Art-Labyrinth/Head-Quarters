export type Master = {
    id: number;
    name: string;
    profession: string | null;
    program_name: string;
    raider: string;
    inspiration: string | null;
    department: string | null;
    program_description: string;
    additional_info: string;
    created_at: string; // ISO date string
    country: string;
    program_example: string;
    conditions: string | null;
    deleted_at: string | null;
    phone: string;
    event_dates: string; // Could be refined if it's a specific format
    experience: string | null;
    form_type: "master"; // Enum if needed
    email: string;
    quantity: string;
    fb: string;
    time: string;
    camping: string | null;
    age: number | null;
    previously_participated: boolean | null;
    duration: string;
    negative: string | null;
    social: string;
    program_direction: "practice" | string; // Could be refined with enum
    lang: string;
    help_now: boolean;
    files: string[]; // Array of URLs
};
