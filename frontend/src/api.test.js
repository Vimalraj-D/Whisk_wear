import { normalizeListResponse } from './api';

describe('normalizeListResponse', () => {
  it('unwraps backend paginated payloads into arrays', () => {
    const payload = { data: [{ id: 1 }, { id: 2 }], pagination: { total: 2 } };
    expect(normalizeListResponse(payload)).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('returns arrays as-is', () => {
    const payload = [{ id: 1 }];
    expect(normalizeListResponse(payload)).toEqual(payload);
  });
});
