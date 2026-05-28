package com.rubiocam.shortener;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface LinkRepository extends JpaRepository<Link, UUID> {
    Optional<Link> findBySlugAndArchivedFalse(String slug);
    boolean existsBySlug(String slug);
}