export const createOxaPayInvoice = async (apiKey: string, amount: number, userId: string): Promise<{ success: boolean; trackId?: string; paymentUrl?: string; error?: string }> => {
  try {
    const response = await fetch('/api/oxapay/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        amount,
        userId,
      }),
    });
    
    const data = await response.json();
    if (response.ok && (data.status === 200 || data.status === '200')) {
      return {
        success: true,
        trackId: String(data.data.track_id),
        paymentUrl: data.data.payment_url,
      };
    } else {
      return {
        success: false,
        error: data.message || 'Failed to create OxaPay invoice',
      };
    }
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error occurred during invoice creation',
    };
  }
};

export const checkOxaPayPayment = async (apiKey: string, trackId: string): Promise<{ success: boolean; status: string; amount: number; error?: string }> => {
  try {
    const response = await fetch('/api/oxapay/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        trackId,
      }),
    });

    const data = await response.json();
    if (response.ok && (data.status === 200 || data.status === '200')) {
      // Check if it's the standard info response or list response
      if (data.data && data.data.status) {
        return {
          success: true,
          status: data.data.status || 'pending',
          amount: Number(data.data.amount || 0),
        };
      } else if (data.data && data.data.list && data.data.list.length > 0) {
        return {
          success: true,
          status: data.data.list[0].status || 'pending',
          amount: Number(data.data.list[0].amount || 0),
        };
      }
    }

    return {
      success: false,
      status: 'Not Found',
      amount: 0,
      error: data.message || 'Invoice status query failed',
    };
  } catch (err: any) {
    return {
      success: false,
      status: 'Error',
      amount: 0,
      error: err.message || 'Network error occurred during status check',
    };
  }
};
