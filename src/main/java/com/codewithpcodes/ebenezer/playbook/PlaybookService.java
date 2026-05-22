package com.codewithpcodes.ebenezer.playbook;

import com.codewithpcodes.ebenezer.exceptions.DuplicateResourceException;
import com.codewithpcodes.ebenezer.exceptions.ResourceNotFoundException;
import com.codewithpcodes.ebenezer.user.MessageResponse;
import com.codewithpcodes.ebenezer.user.User;
import com.codewithpcodes.ebenezer.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PlaybookService {

    private final PlaybookRepository playbookRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<PlaybookResponse> getUserPlaybooks(UUID userId) {
        return playbookRepository
                .findAllByUserIdAndIsActiveTrue(userId)
                .stream()
                .map(PlaybookResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PlaybookResponse getPlaybook(UUID userId, UUID playbookId) {
        return playbookRepository.findByIdAndUserId(playbookId, userId)
                .map(PlaybookResponse::from)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Playbook not found"));
    }

    @Transactional(readOnly = true)
    public List<PlaybookStatsProjection> getPlaybookStats(UUID userId) {
        return playbookRepository.getPlaybookStats(userId);
    }

    public PlaybookResponse createPlaybook(
            UUID userId, PlaybookRequest request) {
        if (playbookRepository.existsByUserIdAndName(
                userId, request.getName())) {
            throw new DuplicateResourceException(
                    "Playbook with that name already exists");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Playbook playbook = Playbook.builder()
                .user(user)
                .name(request.getName())
                .description(request.getDescription())
                .rules(request.getRules()) // stored as JSON string
                .build();

        return PlaybookResponse.from(playbookRepository.save(playbook));
    }

    public PlaybookResponse updatePlaybook(
            UUID userId, UUID playbookId, PlaybookRequest request) {
        Playbook playbook = playbookRepository
                .findByIdAndUserId(playbookId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Playbook not found"));

        if (request.getName() != null) {
            playbook.setName(request.getName());
        }
        if (request.getDescription() != null) {
            playbook.setDescription(request.getDescription());
        }
        if (request.getRules() != null) {
            playbook.setRules(request.getRules());
        }

        return PlaybookResponse.from(playbookRepository.save(playbook));
    }

    public MessageResponse deletePlaybook(UUID userId, UUID playbookId) {
        Playbook playbook = playbookRepository
                .findByIdAndUserId(playbookId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Playbook not found"));

        playbook.setActive(false);
        playbookRepository.save(playbook);

        return new MessageResponse("Playbook deleted successfully");
    }
}
