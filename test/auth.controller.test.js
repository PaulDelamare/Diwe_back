const assert = require('assert');
const User = require('../models/User');
const { create } = require('../controller/auth.controller');

// Test create function
const testCreate = async () => {
    // Test validation failure
    const reqValidationFailure = { body: {} };
    const resValidationFailure = {
        status: (statusCode) => {
            assert.strictEqual(statusCode, 422);
            return {
                json: (responseBody) => {
                    assert.deepStrictEqual(responseBody.errors, []);
                },
            };
        },
    };

    await create(reqValidationFailure, resValidationFailure);

    // Test user creation failure
    const originalCreate = User.create;
    User.create = async (newUser, resulte) => {
        throw new Error('User creation failed');
    };

    const reqCreationFailure = {
        body: {
            firstname: "Paul",
            email: "paul@gmail.com",
            password: "Azerty1!",
            role: "user",
            birthday: "2024-02-01T12:34:56.789Z",
            secret_pin: "098765"
        }
    };
    const resCreationFailure = {
        status: (statusCode) => {
            assert.strictEqual(statusCode, 500);
            return {
                json: (responseBody) => {
                    assert.strictEqual(responseBody.message, 'User creation failed');
                },
            };
        },
    };

    try {
        await create(reqCreationFailure, resCreationFailure);
    } catch (error) {
        // Ensure that the error is caught and has the expected message
        assert.strictEqual(error.message, 'User creation failed');
    }

    // Restore the original User.create method
    User.create = originalCreate;

    // Test user creation success
    const originalCreateSuccess = User.create;
    User.create = async (newUser, resulte) => {
        return {
            _id: 'someUserId',
            firstname: 'John',
            lastname: 'Doe',
            email: 'john.doe@example.com',
            role: 'user',
            birthday: '1990-01-01',
            secret_pin: '123456',
        };
    };

    const reqCreationSuccess = {
        body: {
            firstname: "Paul",
            email: "paul@gmail.com",
            password: "Azerty1!",
            role: "user",
            birthday: "2024-02-01T12:34:56.789Z",
            secret_pin: "098765"
        }
    };
    const resCreationSuccess = {
        status: (statusCode) => {
            assert.strictEqual(statusCode, 201);
            return {
                json: (responseBody) => {
                    assert.strictEqual(responseBody.message, 'Utilisateur créé avec succès');
                },
            };
        },
    };

    await create(reqCreationSuccess, resCreationSuccess);

    // Restore the original User.create method
    User.create = originalCreateSuccess;
};

// Run the test
testCreate();
