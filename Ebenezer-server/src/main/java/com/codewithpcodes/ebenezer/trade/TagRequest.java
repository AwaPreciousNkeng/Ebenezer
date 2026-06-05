package com.codewithpcodes.ebenezer.trade;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TagRequest {

    @NotBlank(message = "Tag value is required")
    @Size(max = 80, message = "Tag too long")
    private String tag;

    private TagType tagType;
}
