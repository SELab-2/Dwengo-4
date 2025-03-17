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
          prisma-fmt-hash = "sha256-uMK8ahkzlzLo/gH7+JmnJCnYjBQ8JKHGuA8ATP1FweM="; 
          query-engine-hash = "sha256-vGCcu5J4PnlgERA/+dov7V19oIS31fihw0oJ9LXh9Pg=";
          libquery-engine-hash = "sha256-lVKV0lvNJq2OE/EH92es2gFwuF410V/qnr1L/fbkDfA=";
          schema-engine-hash = "sha256-hjNSM1ojUPIFNDtyTdI++lAncNUuZuMH0zSWV99rTlM=";
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