const yup = require("yup")

const signUpSchema = yup.object().shape({
    email: yup
        .string()
        .email('Email is not valid')
        .required('Email is required'),

    passwordHash: yup
        .string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .max(15, 'Password must be a maximum of 15 characters'),

    phone: yup
        .string()
        .required('Phone number is required')
        .matches(/^\d{11}$/, "Phone number must be exactly 11 digits")
})

const loginSchema = yup.object().shape({
    email: yup
        .string()
        .email('Email is not valid')
        .required('Email is required'),
    passwordHash: yup
        .string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .max(15, 'Password must be a maximum of 15 characters'),
})

const removeUserSchema = yup.object().shape({
    email: yup.string().email('Email is not valid'),
    phone: yup.string().matches(/^\d{11}$/, "Phone number must be exactly 11 digits")
})

const updateUserSchemaUser = yup.object().shape({
    email: yup.string().email('Email is not valid').optional(),
    password: yup.string()
        .min(8, 'Password must be at least 8 characters')
        .max(15, 'Password must be a maximum of 15 characters')
        .optional(),
    profile: yup.object().shape({
        fullName: yup.string().min(3, 'Full name must be at least 3 characters').optional(),
        phone: yup.string().matches(/^\d{11}$/, "Phone number must be exactly 11 digits").optional(),
        avatar: yup.string().url('Avatar must be a valid URL').optional()
    }).optional()
})

const findOneUserSchema = yup.object().shape({
    phone: yup
        .string()
        .required('Phone number is required')
        .matches(/^\d{11}$/, "Phone number must be exactly 11 digits")
})

const updateUserSchemaAdmin = yup.object().shape({
    email: yup.string().email('Email is not valid').optional(),
    password: yup.string()
        .min(8, 'Password must be at least 8 characters')
        .max(15, 'Password must be a maximum of 15 characters')
        .optional(),
    phone: yup.string().matches(/^\d{11}$/, "Phone number must be exactly 11 digits").optional(),
    isActive: yup.boolean().optional(),
    profile: yup.object().shape({
        fullName: yup.string().min(3, 'Full name must be at least 3 characters').optional(),
        phone: yup.string().matches(/^\d{11}$/, "Phone number must be exactly 11 digits").optional(),
        avatar: yup.string().url('Avatar must be a valid URL').optional()
    }).optional()
})


module.exports = { findOneUserSchema, loginSchema, removeUserSchema, signUpSchema, updateUserSchemaUser, updateUserSchemaAdmin }