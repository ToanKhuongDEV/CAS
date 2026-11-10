package vn.cas.store.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import vn.cas.store.model.StoreSettings;

@Getter
@RequiredArgsConstructor
public class CreateStoreCommand {
    @Setter
    private long id;
    private final StoreSettings settings;
}
