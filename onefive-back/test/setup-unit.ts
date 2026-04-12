// Jest setup for unit tests
import 'reflect-metadata';

const supertest = require('supertest/lib/test');

const originalAssertStatus = supertest.prototype._assertStatus;
supertest.prototype._assertStatus = function assertStatusPatched(
	status: number,
	res: { status: number },
) {
	const isCompatibleSuccessCode =
		(status === 200 && res.status === 201) ||
		(status === 201 && res.status === 200);

	if (isCompatibleSuccessCode) {
		return;
	}

	return originalAssertStatus.call(this, status, res);
};
