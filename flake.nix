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
          prisma-fmt-hash = "sha256-MQnSmx4+S6lQWyn/l2CccbJZG0uHzb4gJV5luAnDl+A="; 
          query-engine-hash = "sha256-ttsqP6XJuo/iIDFX2VqyOaRKsvE9qDDk8Q7Y0aDm71s=";
          libquery-engine-hash = "sha256-oOuR8XtO3I7NDUtx/JXjzHjBxDEFO8jv3x5CgccMzjc=";
          schema-engine-hash = "sha256-3Z76iqOAR5ytdfOkq5XQofnUveXqoqibNjaChGKisiM=";
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