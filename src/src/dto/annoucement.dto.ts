import { string, z } from 'zod'



export interface createAnnoucementDto {
  subject: string;
  body: string;
  link: string;
  selectedUser: { [key: string]: SelectedUser };
}

export interface SelectedUser {
  moderators: string[];
  users: string[];
}
