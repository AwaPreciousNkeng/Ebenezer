package com.codewithpcodes.ebenezer.journal;

import com.codewithpcodes.ebenezer.exceptions.ResourceNotFoundException;
import com.codewithpcodes.ebenezer.user.MessageResponse;
import com.codewithpcodes.ebenezer.user.User;
import com.codewithpcodes.ebenezer.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class JournalService {

    private final JournalEntryRepository journalEntryRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<JournalResponse> getJournalEntries(
            UUID userId, Pageable pageable) {
        return journalEntryRepository
                .findAllByUserIdOrderByEntryDateDesc(userId, pageable)
                .map(JournalResponse::from);
    }

    @Transactional(readOnly = true)
    public JournalResponse getByDate(UUID userId, LocalDate date) {
        return journalEntryRepository
                .findByUserIdAndEntryDate(userId, date)
                .map(JournalResponse::from)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No journal entry found for " + date));
    }

    @Transactional(readOnly = true)
    public Page<JournalResponse> search(
            UUID userId, String keyword, Pageable pageable) {
        return journalEntryRepository
                .searchByKeyword(userId, keyword, pageable)
                .map(JournalResponse::from);
    }

    @Transactional(readOnly = true)
    public List<EmotionTrendProjection> getEmotionTrend(
            UUID userId, int days) {
        LocalDate from = LocalDate.now().minusDays(days);
        return journalEntryRepository.getEmotionTrend(userId, from);
    }

    public JournalResponse createOrUpdate(
            UUID userId, JournalRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        JournalEntry entry = journalEntryRepository
                .findByUserIdAndEntryDate(userId, request.getEntryDate())
                .orElse(JournalEntry.builder()
                        .user(user)
                        .entryDate(request.getEntryDate())
                        .build());

        if (request.getPrePlan() != null) {
            entry.setPrePlan(request.getPrePlan());
        }
        if (request.getPostReview() != null) {
            entry.setPostReview(request.getPostReview());
        }
        if (request.getMarketNotes() != null) {
            entry.setMarketNotes(request.getMarketNotes());
        }
        if (request.getEmotionScore() != null) {
            entry.setEmotionScore(request.getEmotionScore());
        }

        return JournalResponse.from(journalEntryRepository.save(entry));
    }

    public MessageResponse deleteEntry(UUID userId, LocalDate date) {
        JournalEntry entry = journalEntryRepository
                .findByUserIdAndEntryDate(userId, date)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No journal entry found for " + date));

        journalEntryRepository.delete(entry);
        return new MessageResponse("Journal entry deleted");
    }
}
