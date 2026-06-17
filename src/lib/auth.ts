import bcrypt from "bcryptjs";

//creating custom type that accepts the below values plus type guard
export type UserRole = "farmer" | "admin" | "buyer";

//type guard and type casting
export function IsvalidRole(role: unknown): role is UserRole {
  return role === "farmer" || role === "admin" || role === "buyer";
}

export async function hashPassword(password: string) {
 return bcrypt.hash(password, 10);
}

export async function confirmPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function tosafeUser(user:{
  id:number;
  name:string;
  email:string;
  role:UserRole;
  phone:string | null;
  location: string | null;
}) {
  return{
    id:user.id,
    name:user.name,
    email:user.email,
    role:user.role,
    phone:user.phone,
    location:user.location,
  };
}
