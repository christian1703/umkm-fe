import { useState, useEffect, useCallback } from 'react';
import { UserService } from '../service/service';

interface UserData {
    id: string;
    name: string; 
    username: string;
    whatsapp: string;
    role?: string;
}

export const useKasir = () => {
    const [userData, setUserData] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchUser = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await UserService.get({ role: 'KASIR' }); 
            setUserData(response);
        } catch (err) {
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return {
        userData,
        isLoading,
        error,
        refetch: fetchUser,
    };
};