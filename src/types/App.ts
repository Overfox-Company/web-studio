import React from "react";
import {
  type CSSProperties,
  type MouseEventHandler,
  type ReactNode,
} from "react";

export type AddCompanyTypes = {
  name: string;
};
export type UploadImagesType = {
  maxNumber: number;
  label?: string;
  images: any[];
  setImages: any;
  textButton: string;
  variant?: number;
};
export type InputProps = {
  icon?: boolean | undefined;
  name?: string | undefined;
  label?: string | undefined;
  error?: string | undefined | any;
  touched?: boolean | undefined | any;
  placeholder?: string | undefined;
  type?: string | undefined;
  as?: string | undefined;
  rows?: number | undefined;
  cols?: number | undefined;
  children?: React.ReactNode;
};
export type Props = {
  children?: ReactNode;
  onClick?: MouseEventHandler | undefined;
  style?: CSSProperties | undefined;
};
export type AddFile = {
  onClick?: MouseEventHandler;
};
export type ContextData = {
  images: any[],
  setImages: React.Dispatch<React.SetStateAction<any>>
  products: any[],
  setProducts: React.Dispatch<React.SetStateAction<any>>
  maxProducts: number,
  setMaxProducts: React.Dispatch<React.SetStateAction<number>>;
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  isAuthenticated: boolean;
  loader: boolean;
  setLoader: React.Dispatch<React.SetStateAction<boolean>>;
  login: () => void;
  logout: () => void;
  panel: any;
  setPanel: React.Dispatch<React.SetStateAction<any>>;
  isSnackbarOpen: Snackbar;
  setSnackbarOpen: React.Dispatch<React.SetStateAction<any>>;
  ResetAppContext: any;
  brands: any,
  setBrands: React.Dispatch<React.SetStateAction<any>>
  models: any,
  setModels: React.Dispatch<React.SetStateAction<any>>
  colors: any,
  setColors: React.Dispatch<React.SetStateAction<any>>
  storages: any,
  setStorages: React.Dispatch<React.SetStateAction<any>>
  idEditProduct: string,
  setEditProduct: React.Dispatch<React.SetStateAction<any>>
  info: any;
  setInfo: React.Dispatch<React.SetStateAction<any>>;
};
type Snackbar = {
  message: string;
  type: "error" | "warning" | "info" | "success" | undefined;
};
type UserType = {
  name: string;
  user: string;
  lastName: string;
  password: string;
  avatar: string;
  email: string;
  id: string;
  manager: boolean;
  session: string;
  phone: string;
  country: string;
  client: boolean;
  BackgroundImage: string;
  rank: string;
  speciality: string;
  Subscription: any;
  income: string;
  joinDate: string;
  verified: boolean;
  methodRegister: string;
  _id: string;
};
export type ProviderProps = {
  children?: React.ReactNode;
  className?: string;
};

export interface ContainerProps {
  direction?: string | any;
  children: ReactNode;
  justifyContent?: string | any;
  style?: any;
  columnSpacing?: number | any;
  alignItems?: string;
  rowSpacing?: number | any;
  sx?: any;
  gap?: number
}
export interface ItemProps {
  onClick?: any;
  style?: any,
  children: ReactNode;
  xs?: number;
  md?: number;
  sx?: any;
  lg?: number;
  xl?: number;
  sm?: number;
}
export interface TextProps {
  children: ReactNode;
  style?: any;
  white?: boolean;
  sx?: any;
}
export interface ButtonType {
  loading?: boolean;
  children: ReactNode;
  style?: any
  onClick?: any
  type?: 'submit'
  sx?: any
  disabled?: boolean
  component?: string
}
export type models = {
  _id?: string,
  name?: string,
  image?: string
}