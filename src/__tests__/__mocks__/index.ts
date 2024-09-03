import { Request, Response } from "express-serve-static-core";

export const mockRequest = {
	params: {

	},
	body: {},
	query: {},
} as Request;

export const mockResponse = {
	sendStatus: jest.fn(),
	send: jest.fn(),
	status: jest.fn(() => mockResponse),
} as unknown as Response;