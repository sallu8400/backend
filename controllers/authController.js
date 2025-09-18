const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { SendEmail } = require('../utils/mail');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register User
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if user exists and get password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
           token,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Get Current User
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.ProfileUpload = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findByIdAndUpdate(userId, {
      avatar: req.body.avatar, // ✅ fix here
    });

    res.status(200).json({
      success: true,
      message: 'Image upload successful',
    });
  } catch (error) {
    console.error('Image not upload:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};


// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
};


// address

exports.addAddress = async (req, res) => {
  const { street, city, state, zipCode, country, isDefault } = req.body;

  if (!street || !city || !state || !zipCode || !country) {
    return res.status(400).json({ message: "All address fields are required" });
  }

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

const makeDefault = isDefault || user.address.length === 0;
if (makeDefault) {
  user.address.forEach(addr => addr.isDefault = false);
}
user.address.push({ street, city, state, zipCode, country, isDefault: makeDefault });

  await user.save();
  res.status(201).json({ message: 'Address added', addresses: user.address });
};


exports.fetchaddress = async (req, res) => {
 const  data=req.user;
  const user = await User.findById(data._id);
  res.json(user)


};
exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // ✅ Find index of address to delete
    const index = user.address.findIndex(addr => addr._id.toString() === addressId);
    if (index === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    // ✅ Remove address from array
    user.address.splice(index, 1);

    await user.save();

    res.status(200).json({ message: 'Address deleted successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



exports.updateAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.user.id;
    const { street, city, state, zip, isDefault } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Step 1: Agar isDefault true bheja gaya hai, sab address ke isDefault ko false kar do
    if (isDefault) {
      user.address.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Step 2: Specific address ko update karo
    const addressToUpdate = user.address.id(addressId);
    if (!addressToUpdate) {
      return res.status(404).json({ message: 'Address not found' });
    }

    addressToUpdate.street = street || addressToUpdate.street;
    addressToUpdate.city = city || addressToUpdate.city;
    addressToUpdate.state = state || addressToUpdate.state;
    addressToUpdate.zip = zip || addressToUpdate.zip;
    if (isDefault !== undefined) {
      addressToUpdate.isDefault = isDefault;
    }

    await user.save();

    res.status(200).json({ message: 'Address updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Logout (client-side token removal)
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
// forget password



exports.ForgetPassword = async (req, res) => {
  
  const user = await User.findOne({ email: req.body.email });

  console.log(req.body);
   console.log(req.body);

  if (!user) {
    return res.status(404).json({ message: "Email does not exist" });
  }

	
	
	const token = await jwt.sign({ id: user._id }, process.env.FORGET_TOKEN  ,{expiresIn:"15m"});
	const link = `${process.env.DOMAIN}/forgot-password/?token=${token}`
  const sent = await SendEmail(
    user.email,
    "Subject line",
    link,
    user.fullname
  );

  if (!sent) {
    return res.status(424).json({ message: "Email send failed" });
  }

  // ✅ Only one response sent after everything is successful
  res.status(200).json({ message: "Email sent successfully" });

};

exports.ResetPassword = async (req, res) => {
    const { password } = req.body;
    console.log(req.user)

  const EncrypPaswword = await bcrypt.hash(password.toString(), 12);

  const user = await User.findByIdAndUpdate(req.user.id, {
    password: EncrypPaswword,
  });

  if (!user) return res.status(401).json({ message: "Bad Request" });

  res.status(200).json({ message: "Password Reset Successfulll" });
};
 


  exports.sessionpassword = async (req, res) => {
    // const { password } = req.body;

  // const EncrypPaswword = await bcrypt.hash(password.toString(), 12);

  // const user = await User.findByIdAndUpdate(req.user.id, {
  //   password: EncrypPaswword,
  // });

  // if (!user) return res.status(401).json({ message: "Bad Request" });

  // res.status(200).json({ message: "Password Reset Successfulll" });
};

  






