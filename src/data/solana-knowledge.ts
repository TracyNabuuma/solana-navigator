export const solanaKnowledge = {
  developer: [
    {
      q: "How do I set up a Solana dev environment?",
      a: "Install the Solana CLI (`sh -c \"$(curl -sSfL https://release.solana.com/stable/install)\"`), then install Anchor with `cargo install --git https://github.com/coral-xyz/anchor avm --locked`. Use `solana-keygen new` to create a wallet and `solana config set --url devnet` to point at devnet.",
    },
    {
      q: "How do I create a token on Solana?",
      a: "Use the SPL Token CLI:\n```bash\nspl-token create-token\nspl-token create-account <MINT>\nspl-token mint <MINT> 1000\n```\nOr use `@solana/spl-token` from JavaScript with `createMint` and `mintTo`.",
    },
    {
      q: "What is an Anchor program?",
      a: "Anchor is a Rust framework for building Solana programs. It handles serialization, account validation, and IDL generation. A program is declared with `#[program]` and instructions are async functions taking a `Context<T>` of accounts.",
    },
  ],
  consumer: [
    {
      q: "How do I set up a Solana wallet?",
      a: "Install Phantom, Solflare, or Backpack from your app store or browser extension store. Create a new wallet, **write down your seed phrase offline**, and never share it. Fund it by buying SOL on an exchange and withdrawing to your wallet address.",
    },
    {
      q: "How do I stake SOL?",
      a: "Open your wallet (Phantom/Solflare), go to the Stake tab, choose a validator with low commission and good uptime, and delegate. Rewards arrive each epoch (~2 days). You can unstake at any time, with a cool-down of one epoch.",
    },
    {
      q: "How do Solana payments work?",
      a: "Solana Pay lets merchants accept SOL or USDC by generating a QR code. The buyer scans it with a wallet, confirms, and the transaction settles in under a second for fractions of a cent.",
    },
  ],
};
