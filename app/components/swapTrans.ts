// import type { Address } from 'viem';
// import { encodeFunctionData, parseAbi, encodeAbiParameters } from 'viem';
// import { base } from 'viem/chains';
// import type { ProcessSwapTransactionParams, SwapTransaction } from '../types';
// import { sendSwapTransactions } from './sendSwapTransactions';

// // V4 Contract Addresses
// const POOL_MANAGER_V4 = '0x498581ff718922c3f8e6a244956af099b2652b2b' as Address;
// const UNIVERSAL_ROUTER_V4 = '0x6ff5693b99212da76ad316178a184ab56d299b43' as Address;
// const PERMIT2_V4 = '0x000000000022D473030F116dDEE9F6B43aC78BA3' as Address;

// // Flaunch Constants
// const FLETH_ADDRESS = '0x000000000d564d5be76f7f0d28fe52605afc7cf8' as Address;
// const ETH_FLETH_HOOK = '0x9e433f32bb5481a9ca7dff5b3af74a7ed041a888' as Address;
// const FLAUNCH_MEME_HOOK = '0x51Bba15255406Cfe7099a42183302640ba7dAFDC' as Address;

// // V4 Universal Router ABI
// const UNIVERSAL_ROUTER_V4_ABI = parseAbi([
//   'function execute(bytes calldata commands, bytes[] calldata inputs, uint256 deadline) external payable',
// ]);

// // V4 Commands and Actions (from Flaunch docs)
// enum Commands {
//   V4_SWAP = 0x00,
// }

// enum Actions {
//   SWAP_EXACT_IN_SINGLE = 0x00,
//   SETTLE_ALL = 0x01,
//   TAKE_ALL = 0x02,
// }

// export async function processSwapTransaction({
//   chainId,
//   config,
//   isSponsored,
//   paymaster,
//   sendCallsAsync,
//   sendTransactionAsync,
//   swapTransaction,
//   switchChainAsync,
//   updateLifecycleStatus,
//   useAggregator,
//   walletCapabilities,
// }: ProcessSwapTransactionParams) {
//   const { transaction, approveTransaction, quote } = swapTransaction;
//   const transactions: SwapTransaction[] = [];

//   const isFromETH = quote.from.address === '0x0000000000000000000000000000000000000000';
//   const isToETH = quote.to.address === '0x0000000000000000000000000000000000000000';

//   // TOKEN APPROVAL (if swapping from ERC-20 token, not ETH)
//   if (approveTransaction?.data && !isFromETH) {
//     transactions.push({
//       transaction: {
//         to: approveTransaction.to,
//         value: approveTransaction.value,
//         data: approveTransaction.data,
//       },
//       transactionType: 'ERC20',
//     });

//     // Permit2 approval for V4 Universal Router
//     if (!useAggregator) {
//       const permit2ContractAbi = parseAbi([
//         'function approve(address token, address spender, uint160 amount, uint48 expiration) external',
//       ]);
      
//       const permit2Data = encodeFunctionData({
//         abi: permit2ContractAbi,
//         functionName: 'approve',
//         args: [
//           quote.from.address as Address,
//           UNIVERSAL_ROUTER_V4,
//           BigInt(quote.fromAmount),
//           20_000_000_000_000,
//         ],
//       });
      
//       transactions.push({
//         transaction: {
//           to: PERMIT2_V4,
//           value: 0n,
//           data: permit2Data,
//         },
//         transactionType: 'Permit2',
//       });
//     }
//   }

//   // V4 SWAP EXECUTION
//   if (useAggregator) {
//     // Use aggregator's pre-built transaction
//     transactions.push({
//       transaction: {
//         to: transaction.to,
//         value: transaction.value,
//         data: transaction.data,
//       },
//       transactionType: 'Swap',
//     });
//   } else {
//     // Build Flaunch-specific V4 swap transaction
//     const swapTransaction = buildFlaunchSwapTransaction({
//       fromToken: quote.from.address as Address,
//       toToken: quote.to.address as Address,
//       amountIn: BigInt(quote.fromAmount),
//       minAmountOut: BigInt(quote.toAmount), // You might want to apply slippage here
//       referrer: '0x0000000000000000000000000000000000000000' as Address, // Optional referrer
//     });

//     transactions.push({
//       transaction: {
//         to: UNIVERSAL_ROUTER_V4,
//         value: isFromETH ? BigInt(quote.fromAmount) : 0n,
//         data: swapTransaction,
//       },
//       transactionType: 'Swap',
//     });
//   }

//   // Switch to Base if needed
//   if (chainId !== base.id) {
//     await switchChainAsync({ chainId: base.id });
//   }

//   await sendSwapTransactions({
//     config,
//     isSponsored,
//     paymaster,
//     sendCallsAsync,
//     sendTransactionAsync,
//     transactions,
//     updateLifecycleStatus,
//     walletCapabilities,
//   });
// }

// function buildFlaunchSwapTransaction({
//   fromToken,
//   toToken,
//   amountIn,
//   minAmountOut,
//   referrer,
// }: {
//   fromToken: Address;
//   toToken: Address;
//   amountIn: bigint;
//   minAmountOut: bigint;
//   referrer: Address;
// }): `0x${string}` {
//   const isFromETH = fromToken === '0x0000000000000000000000000000000000000000';
//   const isToETH = toToken === '0x0000000000000000000000000000000000000000';

//   // Encode Universal Router command
//   const commands: `0x${string}` = `0x${Commands.V4_SWAP.toString(16).padStart(2, '0')}`;

//   let actions: `0x${string}`;
//   let params: any[];

//   if (isFromETH && !isToETH) {
//     // ETH -> FLETH -> Token (2-step swap from Flaunch docs)
//     actions = `0x${Actions.SWAP_EXACT_IN_SINGLE.toString(16).padStart(2, '0')}${Actions.SWAP_EXACT_IN_SINGLE.toString(16).padStart(2, '0')}${Actions.SETTLE_ALL.toString(16).padStart(2, '0')}${Actions.TAKE_ALL.toString(16).padStart(2, '0')}`;
    
//     params = [
//       // ETH -> FLETH swap
//       encodeAbiParameters(
//         [
//           { name: 'poolKey', type: 'tuple', components: [
//             { name: 'currency0', type: 'address' },
//             { name: 'currency1', type: 'address' },
//             { name: 'fee', type: 'uint24' },
//             { name: 'tickSpacing', type: 'int24' },
//             { name: 'hooks', type: 'address' }
//           ]},
//           { name: 'zeroForOne', type: 'bool' },
//           { name: 'amountIn', type: 'int256' },
//           { name: 'amountOutMinimum', type: 'uint256' },
//           { name: 'sqrtPriceLimitX96', type: 'uint160' },
//           { name: 'hookData', type: 'bytes' }
//         ],
//         [
//           {
//             currency0: '0x0000000000000000000000000000000000000000',
//             currency1: FLETH_ADDRESS,
//             fee: 0,
//             tickSpacing: 60,
//             hooks: ETH_FLETH_HOOK
//           },
//           true,
//           BigInt(-1) * amountIn,
//           0n,
//           BigInt('4295128740'), // TickMath.MAX_TICK - 1 equivalent
//           '0x'
//         ]
//       ),
//       // FLETH -> Token swap
//       encodeAbiParameters(
//         [
//           { name: 'poolKey', type: 'tuple', components: [
//             { name: 'currency0', type: 'address' },
//             { name: 'currency1', type: 'address' },
//             { name: 'fee', type: 'uint24' },
//             { name: 'tickSpacing', type: 'int24' },
//             { name: 'hooks', type: 'address' }
//           ]},
//           { name: 'zeroForOne', type: 'bool' },
//           { name: 'amountIn', type: 'int256' },
//           { name: 'amountOutMinimum', type: 'uint256' },
//           { name: 'sqrtPriceLimitX96', type: 'uint160' },
//           { name: 'hookData', type: 'bytes' }
//         ],
//         [
//           {
//             currency0: FLETH_ADDRESS,
//             currency1: toToken,
//             fee: 0,
//             tickSpacing: 60,
//             hooks: FLAUNCH_MEME_HOOK
//           },
//           true,
//           BigInt(-1) * amountIn,
//           minAmountOut,
//           BigInt('4295128740'),
//           encodeAbiParameters([{ name: 'referrer', type: 'address' }], [referrer])
//         ]
//       ),
//       // Settle ETH
//       encodeAbiParameters(
//         [{ name: 'currency', type: 'address' }, { name: 'amount', type: 'int256' }],
//         ['0x0000000000000000000000000000000000000000', BigInt(-1) * amountIn]
//       ),
//       // Take Token
//       encodeAbiParameters(
//         [{ name: 'currency', type: 'address' }, { name: 'amount', type: 'uint256' }],
//         [toToken, minAmountOut]
//       )
//     ];
//   } else if (!isFromETH && isToETH) {
//     // Token -> FLETH -> ETH (reverse 2-step swap)
//     actions = `0x${Actions.SWAP_EXACT_IN_SINGLE.toString(16).padStart(2, '0')}${Actions.SWAP_EXACT_IN_SINGLE.toString(16).padStart(2, '0')}${Actions.SETTLE_ALL.toString(16).padStart(2, '0')}${Actions.TAKE_ALL.toString(16).padStart(2, '0')}`;
    
//     params = [
//       // Token -> FLETH swap
//       encodeAbiParameters(
//         [
//           { name: 'poolKey', type: 'tuple', components: [
//             { name: 'currency0', type: 'address' },
//             { name: 'currency1', type: 'address' },
//             { name: 'fee', type: 'uint24' },
//             { name: 'tickSpacing', type: 'int24' },
//             { name: 'hooks', type: 'address' }
//           ]},
//           { name: 'zeroForOne', type: 'bool' },
//           { name: 'amountIn', type: 'int256' },
//           { name: 'amountOutMinimum', type: 'uint256' },
//           { name: 'sqrtPriceLimitX96', type: 'uint160' },
//           { name: 'hookData', type: 'bytes' }
//         ],
//         [
//           {
//             currency0: FLETH_ADDRESS,
//             currency1: fromToken,
//             fee: 0,
//             tickSpacing: 60,
//             hooks: FLAUNCH_MEME_HOOK
//           },
//           false,
//           BigInt(-1) * amountIn,
//           0n,
//           BigInt('4295128740'),
//           encodeAbiParameters([{ name: 'referrer', type: 'address' }], [referrer])
//         ]
//       ),
//       // FLETH -> ETH swap
//       encodeAbiParameters(
//         [
//           { name: 'poolKey', type: 'tuple', components: [
//             { name: 'currency0', type: 'address' },
//             { name: 'currency1', type: 'address' },
//             { name: 'fee', type: 'uint24' },
//             { name: 'tickSpacing', type: 'int24' },
//             { name: 'hooks', type: 'address' }
//           ]},
//           { name: 'zeroForOne', type: 'bool' },
//           { name: 'amountIn', type: 'int256' },
//           { name: 'amountOutMinimum', type: 'uint256' },
//           { name: 'sqrtPriceLimitX96', type: 'uint160' },
//           { name: 'hookData', type: 'bytes' }
//         ],
//         [
//           {
//             currency0: '0x0000000000000000000000000000000000000000',
//             currency1: FLETH_ADDRESS,
//             fee: 0,
//             tickSpacing: 60,
//             hooks: ETH_FLETH_HOOK
//           },
//           false,
//           BigInt(-1) * amountIn,
//           minAmountOut,
//           BigInt('4295128740'),
//           '0x'
//         ]
//       ),
//       // Settle Token
//       encodeAbiParameters(
//         [{ name: 'currency', type: 'address' }, { name: 'amount', type: 'int256' }],
//         [fromToken, BigInt(-1) * amountIn]
//       ),
//       // Take ETH
//       encodeAbiParameters(
//         [{ name: 'currency', type: 'address' }, { name: 'amount', type: 'uint256' }],
//         ['0x0000000000000000000000000000000000000000', minAmountOut]
//       )
//     ];
//   } else {
//     // Token -> Token (through FLETH, 2-step swap)
//     actions = `0x${Actions.SWAP_EXACT_IN_SINGLE.toString(16).padStart(2, '0')}${Actions.SWAP_EXACT_IN_SINGLE.toString(16).padStart(2, '0')}${Actions.SETTLE_ALL.toString(16).padStart(2, '0')}${Actions.TAKE_ALL.toString(16).padStart(2, '0')}`;
    
//     params = [
//       // Token A -> FLETH swap
//       encodeAbiParameters(
//         [
//           { name: 'poolKey', type: 'tuple', components: [
//             { name: 'currency0', type: 'address' },
//             { name: 'currency1', type: 'address' },
//             { name: 'fee', type: 'uint24' },
//             { name: 'tickSpacing', type: 'int24' },
//             { name: 'hooks', type: 'address' }
//           ]},
//           { name: 'zeroForOne', type: 'bool' },
//           { name: 'amountIn', type: 'int256' },
//           { name: 'amountOutMinimum', type: 'uint256' },
//           { name: 'sqrtPriceLimitX96', type: 'uint160' },
//           { name: 'hookData', type: 'bytes' }
//         ],
//         [
//           {
//             currency0: FLETH_ADDRESS,
//             currency1: fromToken,
//             fee: 0,
//             tickSpacing: 60,
//             hooks: FLAUNCH_MEME_HOOK
//           },
//           false,
//           BigInt(-1) * amountIn,
//           0n,
//           BigInt('4295128740'),
//           encodeAbiParameters([{ name: 'referrer', type: 'address' }], [referrer])
//         ]
//       ),
//       // FLETH -> Token B swap
//       encodeAbiParameters(
//         [
//           { name: 'poolKey', type: 'tuple', components: [
//             { name: 'currency0', type: 'address' },
//             { name: 'currency1', type: 'address' },
//             { name: 'fee', type: 'uint24' },
//             { name: 'tickSpacing', type: 'int24' },
//             { name: 'hooks', type: 'address' }
//           ]},
//           { name: 'zeroForOne', type: 'bool' },
//           { name: 'amountIn', type: 'int256' },
//           { name: 'amountOutMinimum', type: 'uint256' },
//           { name: 'sqrtPriceLimitX96', type: 'uint160' },
//           { name: 'hookData', type: 'bytes' }
//         ],
//         [
//           {
//             currency0: FLETH_ADDRESS,
//             currency1: toToken,
//             fee: 0,
//             tickSpacing: 60,
//             hooks: FLAUNCH_MEME_HOOK
//           },
//           true,
//           BigInt(-1) * amountIn,
//           minAmountOut,
//           BigInt('4295128740'),
//           encodeAbiParameters([{ name: 'referrer', type: 'address' }], [referrer])
//         ]
//       ),
//       // Settle Token A
//       encodeAbiParameters(
//         [{ name: 'currency', type: 'address' }, { name: 'amount', type: 'int256' }],
//         [fromToken, BigInt(-1) * amountIn]
//       ),
//       // Take Token B
//       encodeAbiParameters(
//         [{ name: 'currency', type: 'address' }, { name: 'amount', type: 'uint256' }],
//         [toToken, minAmountOut]
//       )
//     ];
//   }

//   // Combine actions and params into inputs
//   const inputs = [encodeAbiParameters([{ name: 'actions', type: 'bytes' }, { name: 'params', type: 'bytes[]' }], [actions, params ])];

//   // Execute the swap
//   return encodeFunctionData({
//     abi: UNIVERSAL_ROUTER_V4_ABI,
//     functionName: 'execute',
//     args: [commands, inputs, BigInt(Math.floor(Date.now() / 1000) + 300)], // 5 minute deadline
//   });
// }