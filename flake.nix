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
          prisma-fmt-hash = "sha256-aBRInT5la9jpDicaOWoOeFXhpobZ/7eX2+XjpwGq4jg="; 
          query-engine-hash = "sha256-WYDR5B4+bTYGQcnCXt/G1yOKnkK5EvW1g5ssE31IdBc=";
          libquery-engine-hash = "sha256-EynSJBeJgsz8ybap+6oKgaHQQfD7rQaZYf3FopvvsPY=";
          schema-engine-hash = "sha256-wr0qnOOoi31PVIL6Ql/Qd+K0/MR1+loZ2kYOZjhqy1Y=";
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