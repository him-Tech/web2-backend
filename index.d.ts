declare global {
	namespace Express {
		interface Request {
			customField?: string;
		}
	}
}
