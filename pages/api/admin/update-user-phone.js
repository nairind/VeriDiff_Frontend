// pages/api/admin/update-user-phone.js - Add phone numbers to users
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  
  // Check if user is admin
  const adminEmails = [
    'SALES@VERIDIFF.COM',
    'contact@gubithcm.com'
  ];
  
  if (!session || !adminEmails.includes(session.user.email)) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const { userId, phone } = req.body;

    if (!userId || !phone) {
      return res.status(400).json({ error: 'User ID and phone number required' });
    }

    // Update user phone number
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { phone: phone },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Phone number updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating phone number:', error);
    res.status(500).json({ 
      error: 'Failed to update phone number',
      message: error.message 
    });
  }
}

// SIMPLE FORM TO ADD TO YOUR ADMIN DASHBOARD (optional):
/*

Add this to your admin dashboard where you display users:

<input 
  type="tel" 
  placeholder="Add phone number"
  onBlur={async (e) => {
    if (e.target.value) {
      await fetch('/api/admin/update-user-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          phone: e.target.value
        })
      });
      // Refresh data
      fetchData();
    }
  }}
/>

*/
