export const mockRouter = {
  replace: (_url: string) => {},
  push: (_url: string) => {},
  back: () => {},
};

export function usePathname() {
  return "/";
}

export function useRouter() {
  return mockRouter;
}
