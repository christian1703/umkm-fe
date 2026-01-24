import { useState, useEffect } from 'react';
import { DashboardPayload, DashboardData, dashboardService } from '../service/service';

export const useDashboardData = (payload: DashboardPayload) => {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchDashboard = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await dashboardService.get(payload);
            setDashboardData(response.data);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, [payload.timeFilter, payload.startDate, payload.endDate]);

    return {
        dashboardData,
        isLoading,
        error,
        refetch: fetchDashboard,
    };
};