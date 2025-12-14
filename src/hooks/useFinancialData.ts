import { useState, useEffect } from 'react';
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
                    fetch('./data/kpi_summary.json'),
                    fetch('./data/monthly_summary.json'),
                    fetch('./data/current_month_daily.json').catch(() => null)
                ]);

                if (!kpiRes.ok || !monthlyRes.ok) {
                    throw new Error('Failed to load data files');
                }

                const kpiJson = await kpiRes.json();
                const monthlyJson = await monthlyRes.json();
                const dailyJson = dailyRes && dailyRes.ok ? await dailyRes.json() : { encrypted: false, data: [] };

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
