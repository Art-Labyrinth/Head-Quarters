export type DataItem = {
    id: number;
    form_type: string;

    age: number;
    profession: string;
    department: string;
    camping: string;
    conditions: string;
    help_now: boolean;
    inspiration: string;
    negative: string;
    experience: string;

    name: string;
    country: string | null;
    phone: string;
    email: string | null;
    fb: string | null;
    previously_participated: string | null;
    program_direction: string | null;
    program_name: string | null;
    program_description: string | null;
    event_dates: string | null;
    program_example: string | null;
    social: string | null;
    quantity: number | null;
    time: string | null;
    duration: string | null;
    lang: string | null;
    raider: string | null;
    additional_info: string | null;
    created_at: string;
    deleted_at: string | null;

    files: Array<string>;
}
