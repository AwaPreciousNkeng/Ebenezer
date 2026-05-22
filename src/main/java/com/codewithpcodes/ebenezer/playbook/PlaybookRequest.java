package com.codewithpcodes.ebenezer.playbook;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PlaybookRequest {

    @NotBlank(message = "Playbook name is required")
    @Size(max = 150, message = "Name too long")
    private String name;

    @Size(max = 2000, message = "Description too long")
    private String description;

    // JSON string representing rules
    // e.g. {"max_risk_percent": 1.0,
    //        "entry_criteria": ["Above 200MA"],
    //        "max_daily_trades": 3}
    private String rules;
}
