import { StateData } from "./StateList";
import { ZipcodeData } from "./ZipcodeList";
import { CountryData } from "./CountryList";

export const initialStateData: StateData[] = [
    {
        id: "1",
        name: "India",
        code: "IN",
        country: "India",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
        id: "2",
        name: "New York",
        code: "NY",
        country: "United States",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
        id: "3",
        name: "Texas",
        code: "TX",
        country: "United States",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
        id: "4",
        name: "Florida",
        code: "FL",
        country: "United States",
        isActive: false,
        createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
        id: "5",
        name: "Ontario",
        code: "ON",
        country: "Canada",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z"
    }
];

export const initialZipcodeData: ZipcodeData[] = [
    {
        id: "1",
        code: "90210",
        city: "Beverly Hills",
        state: "California",
        country: "United States",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
        id: "2",
        code: "10001",
        city: "New York",
        state: "New York",
        country: "United States",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
        id: "3",
        code: "75001",
        city: "Dallas",
        state: "Texas",
        country: "United States",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
        id: "4",
        code: "33101",
        city: "Miami",
        state: "Florida",
        country: "United States",
        isActive: false,
        createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
        id: "5",
        code: "M5V 3A8",
        city: "Toronto",
        state: "Ontario",
        country: "Canada",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z"
    }
];

export const initialCountryData: CountryData[] = [
    {
        id: "1",
        name: "India",
        code: "IN",
        phoneCode: "+91",
        currency: "INR",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
        id: "2",
        name: "Canada",
        code: "CA",
        phoneCode: "+1",
        currency: "CAD",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
        id: "3",
        name: "United Kingdom",
        code: "GB",
        phoneCode: "+44",
        currency: "GBP",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
        id: "4",
        name: "Germany",
        code: "DE",
        phoneCode: "+49",
        currency: "EUR",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
        id: "5",
        name: "France",
        code: "FR",
        phoneCode: "+33",
        currency: "EUR",
        isActive: false,
        createdAt: "2024-01-01T00:00:00.000Z"
    },
    {
        id: "6",
        name: "Japan",
        code: "JP",
        phoneCode: "+81",
        currency: "JPY",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z"
    }
]; 