import { BigInt, ethereum,Address, log, crypto, ByteArray, BigDecimal, Bytes   } from "@graphprotocol/graph-ts"
import {
  MurAll,
  NewDataValidatorSet,
  Painted,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  SetPixelsCall
} from "../generated/MurAll/MurAll"
import { ArtistInfo, PaintedEventInfo, MurAllInfo } from "../generated/schema"
import { BIGDECIMAL_TWO, BIGDECIMAL_ZERO, BIGINT_TWO, BIGINT_ZERO, PAINT_TOKEN_ADDRESS_ETH, PAINT_TOKEN_ADDRESS_POLYGON, toDp, ZERO_ADDRESS } from "./constants"



export function handlePainted(event: Painted): void {
  // get the paint token address (change based on network)
  let paintTokenAddress = PAINT_TOKEN_ADDRESS_POLYGON

  let receipt = event.receipt
  if(receipt == null) {
    log.error("receipt is null", [])
    return
  }
  // loop through logs and find the erc20 transfer event to zero address
  for (let i = 0; i < receipt.logs.length; i++) {
    let txLog = receipt.logs[i]
         
    if (txLog != null && txLog.topics[0] == crypto.keccak256(ByteArray.fromUTF8("Transfer(address,address,uint256)"))) {
      let to = Address.fromString("0x"+txLog.topics[2].toHexString().slice(26))
      
      if(to == ZERO_ADDRESS && txLog.address == paintTokenAddress) {
        // burn event
        log.warning("Burn event {}", [event.transaction.hash.toHexString()])

        let from = Address.fromString("0x"+txLog.topics[1].toHexString().slice(26)) as Address
        let artistInfo = getArtistInfo(from)
        let murAllInfo = getMurAllInfo()
        
        let paintBurned = BigInt.fromUnsignedBytes(Bytes.fromUint8Array(txLog.data.reverse())).toBigDecimal()
        let paintBurnedDp = toDp(paintBurned, 18)
        artistInfo.totalPixelsDrawn = artistInfo.totalPixelsDrawn.plus(paintBurnedDp.times(BIGDECIMAL_TWO))
        artistInfo.totalPaintBurned = artistInfo.totalPaintBurned.plus(paintBurned)
        artistInfo.totalPaintBurnedCorrectDp = artistInfo.totalPaintBurnedCorrectDp.plus(paintBurnedDp)
        artistInfo.save()
        
        murAllInfo.totalPixelsDrawn = murAllInfo.totalPixelsDrawn.plus(paintBurnedDp.times(BIGDECIMAL_TWO))
        murAllInfo.totalPaintBurned = murAllInfo.totalPaintBurned.plus(paintBurned)
        murAllInfo.totalPaintBurnedCorrectDp = murAllInfo.totalPaintBurnedCorrectDp.plus(paintBurnedDp)
        murAllInfo.save()

        let paintedEventInfo = new PaintedEventInfo(event.transaction.hash.toHexString())
        paintedEventInfo.artist = from
        paintedEventInfo.paintBurnedRaw = txLog.data
        paintedEventInfo.paintBurned = paintBurned
        paintedEventInfo.paintBurnedCorrectDp = toDp(paintBurned, 18)
        paintedEventInfo.pixelsDrawn = toDp(paintBurned, 18).times(BIGDECIMAL_TWO)
        paintedEventInfo.save()
      }
    }
    
  }
}

function getArtistInfo (address: Address): ArtistInfo {
  let artistInfo = ArtistInfo.load(address.toHexString())
  if (artistInfo == null) {
    artistInfo = new ArtistInfo(address.toHexString())
    artistInfo.totalPaintBurned = BIGDECIMAL_ZERO
    artistInfo.totalPaintBurnedCorrectDp = BIGDECIMAL_ZERO
    artistInfo.totalPixelsDrawn = BIGDECIMAL_ZERO
    artistInfo.save()
  }
  return artistInfo
}

function getMurAllInfo (): MurAllInfo {
  let address = Address.fromString("0x0000000000000000000000000000000000000000")
  let murAllInfo = MurAllInfo.load(address.toHexString())
  if (murAllInfo == null) {
    murAllInfo = new MurAllInfo(address.toHexString())
    murAllInfo.totalPaintBurned = BIGDECIMAL_ZERO
    murAllInfo.totalPaintBurnedCorrectDp = BIGDECIMAL_ZERO
    murAllInfo.totalPixelsDrawn = BIGDECIMAL_ZERO
    murAllInfo.save()
  }
  return murAllInfo
}
