
jest.mock('@anthropic-ai/sdk', () => {
    const mockCreate = jest.fn();
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
            messages: { create: mockCreate },
        })),
        __mockCreate: mockCreate,
    };
});

describe('translateText', () => {
    let mockCreate: jest.Mock;

    beforeEach(() => {
        const sdk = jest.requireMock('@anthropic-ai/sdk');
        mockCreate = sdk.__mockCreate;
        mockCreate.mockReset();
        process.env.ANTHROPIC_API_KEY = 'test-key';
    });

    afterEach(() => {
        delete process.env.ANTHROPIC_API_KEY;
    });

    it('successfully translates text via Claude', async () => {
        mockCreate.mockResolvedValueOnce({
            content: [{ type: 'text', text: 'Hola' }],
        });

        const { translateText } = await import('@/app/actions/translate');
        const result = await translateText('Hello', 'es');

        expect(result).toEqual({ translatedText: 'Hola', provider: 'Claude' });
    });

    it('returns an error object when the API throws', async () => {
        mockCreate.mockRejectedValueOnce(new Error('API error'));

        const { translateText } = await import('@/app/actions/translate');
        const result = await translateText('Hello', 'es');

        expect(result).toHaveProperty('error');
    });
});
