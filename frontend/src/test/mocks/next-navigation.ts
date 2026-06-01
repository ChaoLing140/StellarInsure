export const mockRouter = {
  replace: (_url: string) => {},
  push: (_url: string) => {},
  back: () => {},
};

let mockSearchParams = new URLSearchParams();

export function setMockSearchParams(params: string) {
  mockSearchParams = new URLSearchParams(params);
}

export function usePathname() {
  return "/";
}

export function useRouter() {
  return mockRouter;
}

export function useSearchParams() {
  return mockSearchParams;
}
