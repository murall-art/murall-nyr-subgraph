import { BigDecimal, BigInt, Address } from "@graphprotocol/graph-ts";

export let ZERO_ADDRESS = Address.fromString("0x0000000000000000000000000000000000000000");
export let PAINT_TOKEN_ADDRESS_ETH = Address.fromString("0x4C6eC08CF3fc987c6C4BEB03184D335A2dFc4042");
export let PAINT_TOKEN_ADDRESS_POLYGON = Address.fromString("0x7c28F627eA3aEc8B882b51eb1935f66e5b875714");
export let BIGINT_ZERO = BigInt.fromI32(0);
export let BIGINT_ONE = BigInt.fromI32(1);
export let BIGINT_TWO = BigInt.fromI32(2);
export let BIGDECIMAL_ZERO = new BigDecimal(BIGINT_ZERO);
export let BIGDECIMAL_ONE = new BigDecimal(BIGINT_ONE);
export let BIGDECIMAL_TWO = new BigDecimal(BIGINT_TWO);

export function toDp (value: BigDecimal, dp: u8): BigDecimal {
    return (
      value.div(
      new BigDecimal(BigInt.fromI32(1).times(BigInt.fromI32(10).pow(dp)))
    ))
  }