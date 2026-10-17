
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const { generateToken } = require("../middlewares/generateToken");
const sendMail = require("../utils/sendGrid");
const { getNewuserId } = require("../utils/userIdhandler");

// SIGNUP
const signup = async (req, res) => {
  try {
    const { name, email, password, mobileNumber, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Incomplete Data!" });
    }

    const user = await userModel.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "Email is Already Used!",
      });
    }

    if (mobileNumber) {
      const number = await userModel.findOne({ mobileNumber });

      if (number) {
        return res.status(400).json({
          message: "Mobile number is already in use!",
        });
      }
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = bcrypt.hashSync(password, salt);

    const data = await userModel.create({
      name,
      email,
      password: hashedPassword,
      mobileNumber,
      role,
    });

    const verifyToken = generateToken({
      userId: data._id,
      role: data.role,
    });

    const clientUrl = `${process.env.CLIENT_URL}/verify?token=${verifyToken}`;

    const mailMessage = `
      <div>
        <p>
          Please click
          <a href="${clientUrl}">here</a>
          to confirm your email.
        </p>

        <p>
          If the link is not accessible then copy the following link:
        </p>

        <p>${clientUrl}</p>
      </div>
    `;

    await sendMail({
      email: data.email,
      subject: "Welcome to growcomers! Confirm your email",
      content: mailMessage,
    });

    return res.status(201).json({
      message: "User Created successfully",
    });
  } catch (error) {
    console.error("Signup Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await userModel.findOne({
      email,
      active: true,
    });

    const rawLoginRecord = await mongoose.connection.db.collection(userModel.collection.name).findOne({ email, active: true }, { projection: { email: 1, isVerified: 1, active: 1, role: 1 } }); console.log("LOGIN DIAGNOSTIC:", { database: mongoose.connection.db.databaseName, collection: userModel.collection.name, mongooseResult: user ? { id: user._id.toString(), isVerified: user.isVerified } : null, rawDatabaseResult: rawLoginRecord ? { id: String(rawLoginRecord._id), isVerified: rawLoginRecord.isVerified } : null });

    // IMPORTANT:
    // Check user before accessing user.password
    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    // Google users may not have a password
    if (!user.password) {
      return res.status(400).json({
        message: "Please login using google",
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Account not verified",
      });
    }

    const accessToken = generateToken({
      userId: user._id,
      role: user.role,
    });

    return res.status(200).json({
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
        id: user._id,
        mobileNumber: user.mobileNumber,
        provider: user.provider,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// SHOW ALL USERS
const show = async (req, res) => {
  try {
    let sortOrder =
      req.query.sortOrder || JSON.stringify({ createdAt: -1 });

    const _sortOrder = JSON.parse(sortOrder);

    const nameQuery = req.query.nameQuery;
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;

    page = parseInt(page);
    limit = parseInt(limit);

    const searchQuery = [];

    if (nameQuery) {
      searchQuery.push({
        $match: {
          name: new RegExp(nameQuery, "i"),
        },
      });
    }

    const usersData = await userModel.aggregate([
      ...searchQuery,

      {
        $match: {
          role: "CUSTOMER",
        },
      },

      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          mobileNumber: 1,
          createdAt: 1,
          active: 1,
        },
      },

      {
        $sort: {
          ..._sortOrder,
        },
      },

      {
        $facet: {
          data: [
            {
              $skip: (page - 1) * limit,
            },
            {
              $limit: limit,
            },
          ],

          totalCount: [
            {
              $count: "total",
            },
          ],
        },
      },
    ]);

    const allUsersData = usersData[0]?.data || [];
    const totalUsers = usersData[0]?.totalCount?.[0];

    return res.status(200).json({
      data: allUsersData,
      totalUsers: totalUsers?.total || 0,
      currentPage: page,
      limit: limit,
      nameQuery: nameQuery,
      sortOrder: sortOrder,
    });
  } catch (error) {
    console.error("Show Users Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// SHOW USER BY ROLE
const showUserByRole = async (req, res) => {
  try {
    const role = req.params.role;

    const user = await userModel.find(
      { role: role },
      { password: false }
    );

    return res.status(200).json({
      role: role,
      data: user,
    });
  } catch (error) {
    console.error("Show User By Role Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// SHOW USER BY ID
const showById = async (req, res) => {
  try {
    const id = req.params.id;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const userData = await userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },

      {
        $lookup: {
          from: "addresses",
          localField: "_id",
          foreignField: "userId",
          as: "address",

          pipeline: [
            {
              $match: {
                active: true,
              },
            },

            {
              $project: {
                userId: 0,
                updatedAt: 0,
                __v: 0,
                active: 0,
              },
            },
          ],
        },
      },

      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "userId",
          as: "orders",

          pipeline: [
            {
              $group: {
                _id: null,

                totalExpense: {
                  $sum: "$totalAmount",
                },

                data: {
                  $push: {
                    _id: "$_id",
                    orderId: "$orderId",
                    status: "$status",
                    totalAmount: "$totalAmount",
                    orderDate: "$orderDate",
                  },
                },
              },
            },
          ],
        },
      },

      {
        $lookup: {
          from: "wishlists",
          localField: "_id",
          foreignField: "userId",
          as: "wishlist",

          pipeline: [
            {
              $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "productDetails",
              },
            },

            {
              $unwind: "$productDetails",
            },

            {
              $addFields: {
                imageUrl: {
                  $first:
                    "$productDetails.imageURLHighRes",
                },
              },
            },

            {
              $project: {
                _id: 1,
                addedOn: 1,
                imageUrl: 1,
                productId: "$productDetails._id",
                title: "$productDetails.title",

                price: {
                  $round: [
                    "$productDetails.price",
                    2,
                  ],
                },
              },
            },
          ],
        },
      },

      {
        $lookup: {
          from: "carts",
          localField: "_id",
          foreignField: "userId",
          as: "cart",

          pipeline: [
            {
              $unwind: "$products",
            },

            {
              $lookup: {
                from: "products",
                localField: "products.id",
                foreignField: "_id",
                as: "productDetails",
              },
            },

            {
              $unwind: "$productDetails",
            },

            {
              $addFields: {
                imageUrl: {
                  $first:
                    "$productDetails.imageURLHighRes",
                },
              },
            },

            {
              $project: {
                _id: "$productDetails._id",
                imageUrl: 1,
                quantity: "$products.quantity",
                title: "$productDetails.title",
                price: "$productDetails.price",
              },
            },
          ],
        },
      },

      {
        $unwind: {
          path: "$orders",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          mobileNumber: 1,
          createdAt: 1,
          address: 1,
          reviews: 1,
          wishlist: 1,
          cart: 1,
          active: 1,
          "orders.data": 1,
          "orders.totalExpense": 1,
        },
      },
    ]);

    if (!userData.length) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      data: userData[0],
    });
  } catch (error) {
    console.error("Show User By ID Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// GET USER DETAIL BY TOKEN
const getByToken = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await userModel
      .findById(userId)
      .select("-password");

    if (!user) {
      return res.status(403).json({
        message: "Token is invalid",
      });
    }

    return res.status(200).json({
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
        id: user._id,
        mobileNumber: user.mobileNumber,
      },
    });
  } catch (error) {
    console.error("Get By Token Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE USER
const update = async (req, res) => {
  try {
    const id = req.user.userId;
    const { name, mobileNumber } = req.body;

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (mobileNumber) {
      const checkMobile = await userModel.find({
        _id: { $ne: id },
        mobileNumber: mobileNumber,
      });

      if (checkMobile.length > 0) {
        return res.status(402).json({
          message: "Mobile number already used",
        });
      }
    }

    user.name = name || user.name;
    user.mobileNumber =
      mobileNumber || user.mobileNumber;

    const updatedUser = await user.save();

    return res.status(200).json({
      message: "Updated successfully",

      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobileNumber: updatedUser.mobileNumber,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Update User Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE USER BY ADMIN
const updateByAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name,
      mobileNumber,
      email,
      deactivate,
      password,
    } = req.body;

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (mobileNumber) {
      const checkMobile = await userModel.find({
        _id: { $ne: id },
        mobileNumber: mobileNumber,
      });

      if (checkMobile.length > 0) {
        return res.status(402).json({
          message: "Mobile number already used",
        });
      }
    }

    if (email) {
      const checkEmail = await userModel.find({
        _id: { $ne: id },
        email: email,
      });

      if (checkEmail.length > 0) {
        return res.status(402).json({
          message: "Email already used",
        });
      }
    }

    user.name = name || user.name;
    user.mobileNumber =
      mobileNumber || user.mobileNumber;
    user.email = email || user.email;

    if (password) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = bcrypt.hashSync(
        password,
        salt
      );

      user.password = hashedPassword;
    }

    if (deactivate) {
      user.active = false;
    } else {
      user.active = true;
    }

    const updatedUser = await user.save();

    return res.status(200).json({
      message: "Updated successfully",
      id,

      data: {
        name: updatedUser.name,
        email: updatedUser.email,
        mobileNumber: updatedUser.mobileNumber,
        active: updatedUser.active,
      },
    });
  } catch (error) {
    console.error("Update By Admin Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// UPDATE PASSWORD
const updatePassword = async (req, res) => {
  try {
    const id = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Password login is not available for this account",
      });
    }

    const validPassword = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!validPassword) {
      return res.status(400).json({
        message: "Incorrect password",
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        message: "New password cannot be same as old",
      });
    }

    const salt = await bcrypt.genSalt();

    const hashedPassword = bcrypt.hashSync(
      newPassword,
      salt
    );

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      message: "Updated successfully",
    });
  } catch (error) {
    console.error("Update Password Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE / DEACTIVATE USER
const deleteuser = async (req, res) => {
  try {
    const id = req.user.userId;

    const user = await userModel.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User Deactivated",
      data: user._id,
    });
  } catch (error) {
    console.error("Delete User Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// FORGET PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "No user found with given email",
      });
    }

    const resetToken = generateToken({
      userId: user._id,
      role: user.role,
    });

    const clientUrl =
      `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    const mailMessage = `
      <div>
        <p>
          Please click
          <a href="${clientUrl}">here</a>
          to reset your password.
        </p>

        <p>
          If the link is not accessible then copy the following link:
        </p>

        <p>${clientUrl}</p>
      </div>
    `;

    await sendMail({
      email: user.email,
      subject: "Growcomers! Reset Password",
      content: mailMessage,
    });

    return res.status(200).json({
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// SET PASSWORD
const setPassword = async (req, res) => {
  try {
    const id = req.user.userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    const salt = await bcrypt.genSalt();

    const hashedPassword = bcrypt.hashSync(
      password,
      salt
    );

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Set Password Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

// VERIFY EMAIL
const verifyEmail = async (req, res) => {
  try {
    const id = req.user.userId;

    const user = await userModel.findById(id);

    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }

    user.isVerified = true;

    const userData = await user.save();

    const accessToken = generateToken({
      userId: userData._id,
      role: userData.role,
    });

    return res.status(200).json({
      data: {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        id: userData._id,
        mobileNumber: userData.mobileNumber,
        provider: userData.provider,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Verify Email Error:", error);

    return res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  signup,
  login,
  show,
  showById,
  showUserByRole,
  getByToken,
  update,
  updateByAdmin,
  updatePassword,
  deleteuser,
  verifyEmail,
  forgotPassword,
  setPassword,
};
