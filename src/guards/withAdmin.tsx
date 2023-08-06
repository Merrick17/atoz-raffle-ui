import { authorityAddress } from '@/utils/constants';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const withAdmin = (WrappedComponent: any) => {
    const AdminGuard = (props: any) => {
        const router = useRouter();
        const { connected, publicKey } = useWallet();

        useEffect(() => {

            if (!connected || publicKey?.toBase58() != authorityAddress.toBase58()) {
                router.replace('/');
            }
        }, []);

        if (!connected || publicKey?.toBase58() != authorityAddress.toBase58()) {
            // You can show a loading spinner or other UI while redirecting
            return <div>Loading...</div>;
        }

        // Render the wrapped component if the user is authenticated
        return <WrappedComponent {...props} />;
    };

    return AdminGuard;
};

export default withAdmin;