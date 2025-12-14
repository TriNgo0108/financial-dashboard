import { useState, useEffect } from 'react';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import type { KpiSummary, MonthlyData, DailyData } from '@types';

interface EncryptedData {
    encrypted: boolean;
    data: string;
    salt: string;
}

interface UseFinancialDataReturn {
    kpiData: KpiSummary | null;
    monthlyData: MonthlyData[];
    dailyData: DailyData[];
    loading: boolean;
    error: string | null;
    isEncrypted: boolean;
    authError: string | null;
    handleLogin: (password: string) => void;
}

export const useFinancialData = (): UseFinancialDataReturn => {
    const [kpiData, setKpiData] = useState<KpiSummary | null>(null);
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [dailyData, setDailyData] = useState<DailyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isEncrypted, setIsEncrypted] = useState(false);
    const [encryptedKpi, setEncryptedKpi] = useState<EncryptedData | null>(null);
    const [encryptedMonthly, setEncryptedMonthly] = useState<EncryptedData | null>(null);
    const [encryptedDaily, setEncryptedDaily] = useState<EncryptedData | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [kpiRes, monthlyRes, dailyRes] = await Promise.all([
                    axios.get<any>('./data/kpi_summary.json'),
                    axios.get<any>('./data/monthly_summary.json'),
                    axios.get<any>('./data/current_month_daily.json').catch(() => null)
                ]);

                // Axios throws on non-2xx responses by default, so we don't need to check .ok manually for the first two.
                // If they fail, execution will jump to the catch block.

                const kpiJson = kpiRes.data;
                const monthlyJson = monthlyRes.data;
                const dailyJson = dailyRes ? dailyRes.data : { encrypted: false, data: [] };

                if (kpiJson.encrypted) {
                    setIsEncrypted(true);
                    setEncryptedKpi(kpiJson);
                    setEncryptedMonthly(monthlyJson);
                    setEncryptedDaily(dailyJson.encrypted ? dailyJson : null);
                } else {
                    setKpiData(kpiJson);
                    setMonthlyData(monthlyJson);
                    setDailyData(dailyJson || []);
                }

            } catch (err) {
                console.error(err);
                setError('Failed to load dashboard data. Please check if ETL has run.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleLogin = (password: string) => {
        try {
            if (!encryptedKpi || !encryptedMonthly) return;

            const decryptStandard = (encryptedObj: EncryptedData, pwd: string) => {
                const salt = CryptoJS.enc.Base64.parse(encryptedObj.salt);
                const key = CryptoJS.PBKDF2(pwd, salt, {
                    keySize: 256 / 32,
                    iterations: 100000,
                    hasher: CryptoJS.algo.SHA256
                });

                const rawCiphertext = CryptoJS.enc.Base64.parse(encryptedObj.data);
                const iv = CryptoJS.lib.WordArray.create(rawCiphertext.words.slice(0, 4));
                const ciphertext = CryptoJS.lib.WordArray.create(rawCiphertext.words.slice(4));

                const decrypted = CryptoJS.AES.decrypt(
                    { ciphertext: ciphertext } as any,
                    key,
                    { iv: iv }
                );

                return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
            }

            const kpi = decryptStandard(encryptedKpi, password);
            const monthly = decryptStandard(encryptedMonthly, password);
            const daily = encryptedDaily ? decryptStandard(encryptedDaily, password) : [];

            setKpiData(kpi);
            setMonthlyData(monthly);
            setDailyData(daily);
            setIsEncrypted(false);
            setAuthError(null);

        } catch (err) {
            console.error("Decryption failed", err);
            setAuthError("Incorrect password or data corruption.");
        }
    };

    return {
        kpiData,
        monthlyData,
        dailyData,
        loading,
        error,
        isEncrypted,
        authError,
        handleLogin
    };
};
