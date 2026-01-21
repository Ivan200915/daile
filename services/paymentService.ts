// Payment Service for interactions with backend and Telegram WebApp

interface InvoiceResponse {
    success: boolean;
    link?: string;
    error?: string;
}

export const createInvoice = async (price: number, label: string): Promise<string | null> => {
    try {
        const response = await fetch('/api/create-invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: 'Daily Discipline Premium',
                description: `Upgrade to ${label}`,
                payload: `premium_${price}`,
                price: price, // in Stars (XTR)
                currency: 'XTR'
            })
        });

        const data: InvoiceResponse = await response.json();

        if (data.success && data.link) {
            return data.link;
        } else {
            console.error('Payment creation failed:', data.error);
            return null;
        }
    } catch (error) {
        console.error('Payment API error:', error);
        return null;
    }
};

export const openTelegramInvoice = (invoiceLink: string) => {
    // @ts-ignore
    const tg = window.Telegram?.WebApp;

    if (tg) {
        tg.openInvoice(invoiceLink, (status: string) => {
            if (status === 'paid') {
                tg.close();
                // Rely on backend webhook or refresh user status
                alert('Payment Successful!');
            } else if (status === 'cancelled') {
                // User cancelled
            } else if (status === 'pending') {
                // Pending
            } else {
                alert('Payment Status: ' + status);
            }
        });
    } else {
        // Fallback for browser testing
        window.open(invoiceLink, '_blank');
    }
};
