export type User = {
    id: string;
    email: string;
    name: string;
    phone: string;
    password: string;
    role: string;
}

export type RegisterUser = {
    name: string;
    email: string;
    phone: string;
    password: string;
}

export type LoginUser = {
    email: string;
    password: string;
}