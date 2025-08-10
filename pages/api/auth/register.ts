import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import dbConnect from '@/src/lib/dbConnect'
import User from '@/src/models/User'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, password, name } = req.body

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Missing required fields' })
  }

  await dbConnect()

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user (all users are regular users by default)
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'user',
      workspace: {
        isActive: false
      },
      loginCount: 0
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user.toObject()

    res.status(201).json({ 
      message: 'User created successfully', 
      user: userWithoutPassword 
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}