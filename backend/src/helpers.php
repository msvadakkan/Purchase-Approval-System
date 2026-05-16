<?php

function respond(array $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function normalize($doc): ?array {
    if ($doc === null) return null;
    $result = [];
    foreach ($doc as $key => $value) {
        if ($key === '_id') {
            $result['id'] = (string)$value;
        } elseif ($value instanceof \MongoDB\BSON\UTCDateTime) {
            $result[$key] = $value->toDateTime()->format('c');
        } elseif ($value instanceof \MongoDB\BSON\ObjectId) {
            $result[$key] = (string)$value;
        } elseif ($value instanceof \MongoDB\Model\BSONDocument) {
            $result[$key] = normalize($value);
        } elseif ($value instanceof \MongoDB\Model\BSONArray) {
            $arr = [];
            foreach ($value as $item) {
                if ($item instanceof \MongoDB\Model\BSONDocument || $item instanceof \MongoDB\Model\BSONArray) {
                    $arr[] = normalize($item);
                } elseif ($item instanceof \MongoDB\BSON\ObjectId) {
                    $arr[] = (string)$item;
                } elseif ($item instanceof \MongoDB\BSON\UTCDateTime) {
                    $arr[] = $item->toDateTime()->format('c');
                } else {
                    $arr[] = $item;
                }
            }
            $result[$key] = $arr;
        } else {
            $result[$key] = $value;
        }
    }
    return $result;
}

function normalizeMany(iterable $docs): array {
    $result = [];
    foreach ($docs as $doc) {
        $result[] = normalize($doc);
    }
    return $result;
}

function utcNow(): \MongoDB\BSON\UTCDateTime {
    return new \MongoDB\BSON\UTCDateTime();
}

function objectId(string $id): \MongoDB\BSON\ObjectId {
    return new \MongoDB\BSON\ObjectId($id);
}
