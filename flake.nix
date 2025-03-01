{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    prisma-utils.url = "github:VanCoding/nix-prisma-utils";
  };

  outputs =
    { nixpkgs, prisma-utils, ... }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
      prisma =
        (prisma-utils.lib.prisma-factory {
          inherit pkgs;
          # just copy these hashes for now, and then change them when nix complains about the mismatch
          prisma-fmt-hash = "sha256-0PSvJ2tB5pBS7k65qsF2MCV3s06orrDYDkaC5jnfbPU="; 
          query-engine-hash = "sha256-G2iumxi4HMqcSdmYm+KAlj0k2haX9EE9bh7CScdX7lU=";
          libquery-engine-hash = "sha256-Uxs7CWqxgBhOivn495YkndEsrG55hHpYrNjdCeUrqwk=";
          schema-engine-hash = "sha256-08sTw6io+Cyx5O2Mnk/yflAcgzZYxMOPGGSM6OLzqRA=";
        }).fromNpmLock
          ./dwengo_backend/package-lock.json; # <--- path to our package-lock.json file that contains the version of prisma-engines
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        env = prisma.env;
        # or, you can use `shellHook` instead of `env` to load the same environment variables.
        # shellHook = prisma.shellHook;
      };
    };
}